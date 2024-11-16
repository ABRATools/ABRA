from sqlalchemy import and_, func
from .models import User, Group
import datetime

def get_hash_for_user(db, username):
    try:
        return db.query(User).filter(User.username == username).first().password
    except AttributeError:
        return None

# class Group(Base):
#     __tablename__ = 'groups'
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(50), nullable=False)
#     permissions = Column(MutableList.as_mutable(String), nullable=True)
#     users = relationship("User", secondary=user_groups, back_populates="groups")

def create_group(db, name):
    # default permissions for a group (admin)
    group = Group(name=name, permissions="create, read, update, delete")
    db.add(group)
    db.commit()

def get_user_groups(db, username):
    try:
        return db.query(User).filter(User.username == username).first().groups
    except AttributeError:
        return None

def add_user_to_group(db, username, group):
    user = db.query(User).filter(User.username == username).first()
    group = db.query(Group).filter(Group.name == group).first()
    user.groups.append(group)
    db.commit()

# class User(Base):
#     __tablename__ = 'users'
#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String(255), nullable=False, unique=True)
#     email = Column(String(255), nullable=True)
#     # hashed password
#     password = Column(String(60), nullable=False)
#     passwordChangeDate = Column(DateTime, default="", nullable=True)
#     is_active = Column(Boolean, default=True)
#     totp_secret = Column(String(50), nullable=True)
#     is_totp_enabled = Column(Boolean, default=True)
#     is_totp_confirmed = Column(Boolean, default=False)
#     # user can have multiple notifications
#     notifications = relationship("Notification", secondary=user_notifications, back_populates="users")
#     # user can have multiple groups
#     groups = relationship("Group", secondary=user_groups, back_populates="users")

def create_user(db, username, password, admin):
    if db.query(User).filter(User.username == username).first() is not None:
        print(f"User {username} already exists")
        return

    # get max id
    max_id = db.query(func.max(User.id)).scalar()
    if max_id is None:
        max_id = 0
    # increment max id (WE LOVE SUPPLEMENTAL PRIMARY KEYS IN THIS HOUSE NATURAL KEYS ARE FOR LOSERS)
    max_id += 1

    user = User(id=max_id, username=username, email="", password=password, is_active=True)
    if admin:
        group = db.query(Group).filter(Group.name == 'admin').first()
        if group is None:
            print("Admin group does not exist... creating")
            create_group(db, 'admin')
        user.groups.append(group)
    db.add(user)
    db.commit()

def update_user_email(db, username, email):
    user = db.query(User).filter(User.username == username).first()
    user.email = email
    db.commit()

def update_user_password(db, username, password):
    user = db.query(User).filter(User.username == username).first()
    user.password = password
    user.passwordChangeDate = datetime.datetime.now(tz=datetime.timezone.utc)
    db.commit()

def update_user_totp_secret(db, username, secret):
    user = db.query(User).filter(User.username == username).first()
    user.totp_secret = secret
    user.is_totp_enabled = True
    db.commit()

def update_user_totp_confirmed(db, username):
    user = db.query(User).filter(User.username == username).first()
    user.is_totp_confirmed = True
    db.commit()

def reset_totp_secret(db, username):
    user = db.query(User).filter(User.username == username).first()
    user.totp_secret = None
    user.is_totp_enabled = False
    user.is_totp_confirmed = False
    db.commit()