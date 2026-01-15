export const WISDOM_QUOTES = [
  {
    text: "Sesungguhnya Allah tidak melihat rupa dan harta kalian, tetapi melihat hati dan amal kalian.",
    source: "HR. Muslim",
  },
  {
    text: "Barangsiapa menempuh jalan untuk mencari ilmu, Allah mudahkan jalannya menuju surga.",
    source: "HR. Muslim",
  },
  {
    text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.",
    source: "HR. Ahmad & Thabrani",
  },
  {
    text: "Orang mukmin yang kuat lebih baik dan lebih dicintai Allah daripada mukmin yang lemah.",
    source: "HR. Muslim",
  },
  {
    text: "Senyummu kepada saudaramu adalah sedekah.",
    source: "HR. Tirmidzi",
  },
  {
    text: "Tidak sempurna iman seseorang hingga ia mencintai saudaranya sebagaimana ia mencintai dirinya sendiri.",
    source: "HR. Bukhari & Muslim",
  },
  {
    text: "Jagalah Allah, niscaya Dia menjagamu. Jagalah Allah, niscaya engkau mendapati-Nya di hadapanmu.",
    source: "HR. Tirmidzi",
  },
  {
    text: "Barangsiapa bertakwa kepada Allah, niscaya Dia akan memberinya jalan keluar.",
    source: "QS. At-Talaq: 2",
  },
] as const;

export function getRandomWisdom() {
  return WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
}