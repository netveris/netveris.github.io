import { useState } from 'react';
import { Lock, Unlock, Key, Copy, Check } from 'lucide-react';
import { ToolHeader } from '../components/tool-header';
import { Button } from '../components/ui/button/button';
import { Card } from '../components/ui/card/card';
import { Textarea } from '../components/ui/textarea/textarea';
import { Label } from '../components/ui/label/label';
import { Input } from '../components/ui/input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select/select';
import styles from './aes-encryption.module.css';

export function meta() {
  return [
    { title: "AES Encryption - Netveris" },
    { name: "description", content: "Encrypt and decrypt data with AES algorithm" },
  ];
}

export default function AESEncryption() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [algorithm, setAlgorithm] = useState('AES-GCM');
  const [keySize, setKeySize] = useState('256');
  const [input, setInput] = useState('');
  const [key, setKey] = useState('');
  const [iv, setIv] = useState('');
  const [output, setOutput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateKey = () => {
    const size = parseInt(keySize) / 8;
    const array = new Uint8Array(size);
    crypto.getRandomValues(array);
    setKey(Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(''));
  };

  const generateIV = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    setIv(Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(''));
  };

  const hexToBytes = (hex: string) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  };

  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const processData = async () => {
    if (!input || !key) return;
    
    setProcessing(true);
    try {
      const keyBytes = hexToBytes(key);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: algorithm, length: parseInt(keySize) },
        false,
        [mode === 'encrypt' ? 'encrypt' : 'decrypt']
      );

      if (mode === 'encrypt') {
        const ivBytes = iv ? hexToBytes(iv) : crypto.getRandomValues(new Uint8Array(16));
        const encoded = new TextEncoder().encode(input);
        const encrypted = await crypto.subtle.encrypt(
          { name: algorithm, iv: new Uint8Array(ivBytes.buffer.slice(0)) },
          cryptoKey,
          encoded
        );
        const result = bytesToHex(new Uint8Array(encrypted));
        setOutput(`IV: ${bytesToHex(ivBytes)}\nCiphertext: ${result}`);
        if (!iv) setIv(bytesToHex(ivBytes));
      } else {
        if (!iv) {
          setOutput('Error: IV is required for decryption');
          return;
        }
        const ivBytes = hexToBytes(iv);
        const ciphertext = hexToBytes(input.replace(/^IV:.*\nCiphertext:\s*/i, '').trim());
        const decrypted = await crypto.subtle.decrypt(
          { name: algorithm, iv: new Uint8Array(ivBytes.buffer.slice(0)) },
          cryptoKey,
          new Uint8Array(ciphertext.buffer.slice(0))
        );
        const result = new TextDecoder().decode(decrypted);
        setOutput(result);
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Encryption/decryption failed'}`);
    } finally {
      setProcessing(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <ToolHeader
        icon={<Lock size={24} />}
        title="AES Encryption/Decryption"
        description="Encrypt and decrypt data using Advanced Encryption Standard (AES)"
      />

      <div className={styles.content}>
        <Card className={styles.card}>
          <div className={styles.controls}>
            <div className={styles.row}>
              <div className={styles.field}>
                <Label>Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as 'encrypt' | 'decrypt')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="encrypt">Encrypt</SelectItem>
                    <SelectItem value="decrypt">Decrypt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.field}>
                <Label>Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AES-GCM">AES-GCM</SelectItem>
                    <SelectItem value="AES-CBC">AES-CBC</SelectItem>
                    <SelectItem value="AES-CTR">AES-CTR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.field}>
                <Label>Key Size (bits)</Label>
                <Select value={keySize} onValueChange={setKeySize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128-bit</SelectItem>
                    <SelectItem value="192">192-bit</SelectItem>
                    <SelectItem value="256">256-bit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={styles.field}>
              <Label>Encryption Key (Hex)</Label>
              <div className={styles.inputGroup}>
                <Input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter hex key or generate one"
                  className={styles.keyInput}
                />
                <Button onClick={generateKey} variant="outline" size="sm">
                  <Key size={16} />
                  Generate Key
                </Button>
              </div>
            </div>

            <div className={styles.field}>
              <Label>Initialization Vector (IV) - Hex</Label>
              <div className={styles.inputGroup}>
                <Input
                  value={iv}
                  onChange={(e) => setIv(e.target.value)}
                  placeholder="Enter IV or generate one"
                  className={styles.keyInput}
                />
                <Button onClick={generateIV} variant="outline" size="sm">
                  <Key size={16} />
                  Generate IV
                </Button>
              </div>
            </div>

            <div className={styles.field}>
              <Label>{mode === 'encrypt' ? 'Plaintext' : 'Ciphertext (Hex)'}</Label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Paste ciphertext to decrypt...'}
                rows={6}
                className={styles.textarea}
              />
            </div>

            <Button onClick={processData} disabled={processing || !input || !key} className={styles.processButton}>
              {mode === 'encrypt' ? <Lock size={18} /> : <Unlock size={18} />}
              {processing ? 'Processing...' : mode === 'encrypt' ? 'Encrypt Data' : 'Decrypt Data'}
            </Button>
          </div>
        </Card>

        {output && (
          <Card className={styles.card}>
            <div className={styles.outputHeader}>
              <Label>{mode === 'encrypt' ? 'Encrypted Output' : 'Decrypted Output'}</Label>
              <Button onClick={copyOutput} variant="ghost" size="sm">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <Textarea
              value={output}
              readOnly
              rows={8}
              className={styles.output}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
