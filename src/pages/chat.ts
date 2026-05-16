export type Role = 'candidate' | 'company';

export interface ChatData {
  role: Role | null;
  name?: string;
  jobTitle?: string;
  city?: string;
  experience?: string;
  availability?: string;
  contractType?: string;
  hiringCount?: string;
}

export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export type ChatStep = 
  | 'START'
  | 'CAND_JOB' | 'CAND_CITY' | 'CAND_RELOC' | 'CAND_EXP' | 'CAND_NAME' | 'CAND_VIDEO' | 'CAND_FINAL'
  | 'COMP_PERSONNEL' | 'COMP_ROLE' | 'COMP_CITY' | 'COMP_CONTRACT' | 'COMP_COUNT' | 'COMP_SUMMARY' | 'COMP_FINAL';