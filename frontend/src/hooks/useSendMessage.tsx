// https://discord.com/api/webhooks/1339693417978138635/KyL5E76vh7K703r61kDxlQTp78k89UOWuh--C0OIww_g3ZRgGHSE7AdWjonwZNV_M0dt

import { useState } from 'react';

const useSendMessage = (webhookUrl: string, platform = 'discord') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPayload = (message: string) => {
    if (platform === 'slack') {
      return { text: message };
    }
    return { content: message };
  };

  const sendMessage = async (message: string) => {
    setLoading(true);
    setError(null);
    try {
      const payload = getPayload(message);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
};

export default useSendMessage;
