import { describe, it, expect, vi, beforeEach } from 'vitest';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContactForm(name: string, email: string, message: string) {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    return { valid: false, error: 'Please fill in all required fields (Name, Email, and Message).' };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  return {
    valid: true,
    payload: {
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      subject: `Portfolio inquiry from ${trimmedName}`,
      from_name: trimmedName,
    },
  };
}

async function submitToWeb3Forms(
  payload: Record<string, string>,
  accessKey: string,
  fetchFn: typeof fetch = fetch
) {
  if (!accessKey) {
    throw new Error('Access key is missing');
  }

  const response = await fetchFn('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      access_key: accessKey,
      ...payload,
    }),
  });

  const data = await response.json().catch(() => null);

  if (response.ok && data?.success) {
    return { success: true, message: data.message || 'Message sent!' };
  } else {
    return {
      success: false,
      message: data?.message || 'Failed to send message. Please try again or reach out directly.',
    };
  }
}

describe('Contact Form Validation & Submission Logic', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects empty fields', () => {
    const result = validateContactForm('', 'test@example.com', 'Hello');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('fill in all required fields');
  });

  it('rejects whitespace-only fields', () => {
    const result = validateContactForm('   ', 'test@example.com', '   ');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('fill in all required fields');
  });

  it('rejects malformed emails', () => {
    const badEmails = ['plainaddress', '@missingusername.com', 'username@.com', 'user@domain'];
    for (const email of badEmails) {
      const result = validateContactForm('Ziad', email, 'Hello there');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid email');
    }
  });

  it('accepts valid input and creates payload with proper subject', () => {
    const result = validateContactForm('  Jane Doe  ', 'jane@example.com  ', '  Great portfolio! ');
    expect(result.valid).toBe(true);
    expect(result.payload).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Great portfolio!',
      subject: 'Portfolio inquiry from Jane Doe',
      from_name: 'Jane Doe',
    });
  });

  it('submits successfully when Web3Forms returns success: true', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Email sent successfully!' }),
    });

    const res = await submitToWeb3Forms(
      { name: 'John', email: 'john@example.com', message: 'Hello' },
      'test-key-123',
      mockFetch as any
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.web3forms.com/submit',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
    );

    const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(calledBody.access_key).toBe('test-key-123');
    expect(calledBody.name).toBe('John');
    expect(res.success).toBe(true);
    expect(res.message).toBe('Email sent successfully!');
  });

  it('handles API rejection when Web3Forms returns success: false', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, message: 'Invalid access key' }),
    });

    const res = await submitToWeb3Forms(
      { name: 'John', email: 'john@example.com', message: 'Hello' },
      'bad-key',
      mockFetch as any
    );

    expect(res.success).toBe(false);
    expect(res.message).toBe('Invalid access key');
  });

  it('handles network failure gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    await expect(
      submitToWeb3Forms(
        { name: 'John', email: 'john@example.com', message: 'Hello' },
        'test-key',
        mockFetch as any
      )
    ).rejects.toThrow('Network offline');
  });
});
