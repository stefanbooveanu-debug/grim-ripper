export const PROJECT = {
  name: 'Grim Dropper',
  tagline: 'Deploy · Obfuscate · Evade detection',
  track: 'Defense Technologies',
} as const;

export const SECTIONS = [
  {
    id: 'problem',
    title: 'Problem',
    body: `In the field of red-teaming operations, deploying and propagating payloads effectively is crucial. However, traditional tools often lack the necessary security features to protect against modern detection techniques used by antivirus software and endpoint protection systems. This leads to payloads being detected and neutralized before they can achieve their intended impact.`,
  },
  {
    id: 'solution',
    title: 'Proposed solution',
    body: `The Grim Dropper is a red-teaming solution designed to facilitate the deployment and propagation of payloads. It combines packing, obfuscation and encryption to ensure that the payload remains undetected and effective in its target environment.`,
  },
  {
    id: 'description',
    title: 'Description',
    body: `The Grim Dropper is a red-teaming solution designed to facilitate the deployment and propagation of payloads. It combines packing, obfuscation and encryption to ensure that the payload remains undetected and effective in its target environment.`,
  },
] as const;

export const DEMO_STEPS = [
  'Upload or select a payload file',
  'Configure packing, obfuscation, and encryption',
  'Run the pipeline and review detection metrics',
  'Export the hardened artifact for deployment',
] as const;

export const PIPELINE_STEPS = [
  { id: 'pack', label: 'Pack', description: 'Compress and structure the raw payload' },
  { id: 'obfuscate', label: 'Obfuscate', description: 'Rename symbols and flatten control flow' },
  { id: 'encrypt', label: 'Encrypt', description: 'Apply AES layer with runtime decryption stub' },
] as const;
