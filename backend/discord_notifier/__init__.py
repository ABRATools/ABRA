import sys, os
sys.path.insert(0, os.path.abspath('..'))
from logger import logger

import re
import time
import asyncio
import discord
import requests
from classes import *
import database as db
import multiprocessing
from typing import List
from config import settings
from discord.ext import commands
from discord import app_commands

abra_enabled = True

class Bot(commands.Bot):
	async def on_ready(self):
		print(f'Logged on as {self.user}!')
		bot.loop.create_task(monitor())

		try:
			guild = discord.Object(id=TEST_GUILD_ID)
			synced = await self.tree.sync(guild=guild)
			print(f'Synced {len(synced)} commands to guild {guild.id}')

		except Exception as e:
			print(f'Error syncing commands: {e}')

	async def on_message(self, message):
		if message.author == self.user:
			return

intents = discord.Intents.default()
intents.message_content = True
bot = Bot(command_prefix="!", intents=intents)

GUILD_ID = discord.Object(id=TEST_GUILD_ID)

def parse_line(line):
	if "| INFO |" in line:
		
		# system added
		result = system_added(line)
		if result:
			return result
		
		# system removed
		result = system_removed(line)
		if result:
			return result
			
		# environment added
		result = environment_added(line)
		if result:
			return result

		# environment removed
		result = environment_removed(line)
		if result:
			return result

		# user log in
		result = logged_in(line)
		if result:
			return result

		# user log out
		result = logged_out(line)
		if result:
			return result

		return None
	
	if "| WARNING |" in line:

		# auth failure
		result = auth_failure(line)
		if result:
			return result

		else:
			result = warning(line)
			if result:
				return result
			
	if "| ERROR | " in line:

		result = error(line)
		if result:
			return result
	
	return None

def system_added(line):
	match = re.search(r"Adding system to listing: ([\w\-]+) with (\d+) environments", line)

	if match:
		system_name = match.group(1)
		num_environments = match.group(2)

		embed = discord.Embed(
			title = "New System Added",
			description = f"System **{system_name}** has been added.",
			color = discord.Color.purple()
		)
		
		embed.add_field(name="Environments", value=num_environments, inline=False)
		return embed
	
def system_removed(line):
	return None

def logged_in(line):
	match = re.search(r"User ([\w\-]+) has successfully logged in", line)

	if match:
		user = match.group(1)
		embed = discord.Embed(
			title = "User Logged In",
			description = f"User **{user}** has successfully logged in.",
			color = discord.Color.purple()
		)
		
		return embed
	
def logged_out(line):
	return None

def auth_failure(line):
	return None

def environment_added(line):
	system_match = re.search(r"Adding environment to system (\w+)", line)
	env_match = re.search(r"\{(.*?)\}", line)

	if system_match and env_match:
		system_name = system_match.group(1)
		env_raw_data = env_match.group(1)

		env_data = {}
		for item in env_raw_data.split(","):
			key, value = item.split(":")
			key = key.strip().strip("'")
			value = value.strip().strip("'")
			env_data[key] = value

		embed = discord.Embed(
			title = "New Environment Added",
			description = f"A new containerized environment has been added to system **'{system_name}'**.",
			color = discord.Color.purple()
		)

		embed.add_field(name="Environment Name", value=env_data.get("name", "unknown"), inline=True)
		embed.add_field(name="Container ID", value=env_data.get("container_id", "N/A"), inline=True)
		embed.add_field(name="OS", value=env_data.get("os", "N/A"), inline=True)
		embed.add_field(name="Status", value=env_data.get("status", "N/A"), inline=True)

		return embed	
	
def environment_removed(line):
	return None

def warning(line):
	match = re.match(r"^.*\| WARNING \| (.*)$", line)
	if not match:
		return None
		
	message = match.group(1).strip()
	embed = discord.Embed(
		title = "Warning",
		description = message,
		color = discord.Color.red()
	)

	return embed

def error(line):
	match = re.match(r"^.*\| ERROR \| (.*)$", line)
	if not match:
		return None
		
	message = match.group(1).strip()
	embed = discord.Embed(
		title = "Error",
		description = message,
		color = discord.Color.red()
	)

	return embed	

# repeatedly checking log file
async def monitor():
	await bot.wait_until_ready()

	channel = bot.get_channel(CHANNEL_ID)
	if channel is None:
		print("Channel not found. CHeck the ID or bot permissions.")
		return
	
	await channel.send("Now actively monitoring!")

	with open(LOGFILE_PATH, "r") as log_file:
		log_file.seek(0, os.SEEK_END)

		while not bot.is_closed():
			line = log_file.readline()

			if not line:
				await asyncio.sleep(1)
				continue

			line = line.strip()
			if line and abra_enabled:
				response = parse_line(line)
				if response:
					await channel.send(embed=response)

@bot.tree.command(name="status", description="Report Status", guild=GUILD_ID)
async def getStatus(interaction: discord.Interaction):
	if not abra_enabled:
		return

	embed = discord.Embed(title="Status Report", description="Status description.", color=discord.Color.purple())
	embed.add_field(name="", value="", inline=False)
	await interaction.response.send_message(embed=embed)

@bot.tree.command(name="disable", description="Disable ABRA Discord Service", guild=GUILD_ID)
async def disable(interaction: discord.Interaction):
	global abra_enabled
	abra_enabled = False

	await bot.change_presence(status=discord.Status.offline)
	await interaction.response.send_message("ABRA Discord Service has been **disabled**.")

@bot.tree.command(name="enable", description="Enable ABRA Discord Service", guild=GUILD_ID)
async def enable(interaction: discord.Interaction):
	global abra_enabled
	abra_enabled = True

	await bot.change_presence(status=discord.Status.online, activity=discord.Game("Monitoring!"))
	await interaction.response.send_message("ABRA Discord Service has been **enabled**.")

bot.run(TOKEN)