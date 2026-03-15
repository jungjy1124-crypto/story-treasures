const KO_BLOCKED = [
  '씨발','시발','씨팔','개새끼','개새','새끼','병신','미친놈','미친년',
  '지랄','꺼져','닥쳐','존나','좆','보지','자지','창녀','걸레',
  '쓰레기','찐따','장애인','멍청이','바보','돼지','뚱땡이'
];

const EN_BLOCKED = [
  'fuck','shit','bitch','asshole','bastard','cunt','dick',
  'pussy','nigger','faggot','whore','slut','retard','idiot'
];

const POLITICAL_BLOCKED = [
  '윤석열','이재명','문재인','박근혜','이명박','노무현',
  '민주당','국민의힘','더불어','자유한국당','국힘',
  '탄핵','종북','좌빨','빨갱이','토착왜구','친일',
  '박정희','전두환','노태우',
  '대통령','선거','투표','정치','국회의원',
  '일베','워마드','페미','한남','김치녀',
  '북한','김정은','주사파','종전','핵',
  'ㅇㅅㅇ','ㅂㅅ','ㅄ','ㅅㅂ','ㅈㄹ'
];

const ALL_BLOCKED = [...KO_BLOCKED, ...EN_BLOCKED, ...POLITICAL_BLOCKED];

export function filterText(text: string, fieldLabel: string, maxLen = 300): { ok: boolean; reason?: string } {
  const trimmed = text.trim();
  if (trimmed.length < 2) return { ok: false, reason: `${fieldLabel}이(가) 너무 짧아요` };
  if (trimmed.length > maxLen) return { ok: false, reason: `${maxLen}자 이내로 작성해주세요` };

  const lower = trimmed.toLowerCase();
  for (const word of ALL_BLOCKED) {
    if (lower.includes(word.toLowerCase())) {
      return { ok: false, reason: '부적절한 내용이 포함되어 있어요' };
    }
  }
  return { ok: true };
}

export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return `${Math.floor(days / 30)}달 전`;
}

export function maskNickname(name: string): string {
  if (name.length <= 2) return name[0] + '*';
  return name.slice(0, 2) + '*'.repeat(name.length - 2);
}
