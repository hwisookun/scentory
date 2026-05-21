// Shared mock data for the 맡다. UI kit
window.MATDA_DATA = (() => {
  // Evolved scent-tag palette — warmer, dustier, emotional
  const SCENT_COLORS = {
    '플로럴':  {bg:'#FBDCE8', fg:'#C94277'},
    '시트러스':{bg:'#FDF1C4', fg:'#CC8500'},
    '우디':    {bg:'#EADFCF', fg:'#6E4B2E'},
    '머스크':  {bg:'#EBDFF1', fg:'#7A4A9C'},
    '프레시':  {bg:'#D8EEFC', fg:'#1F78B0'},
    '오리엔탈':{bg:'#F8D6C8', fg:'#B24B22'},
    '아쿠아틱':{bg:'#CFEDEF', fg:'#036B7C'},
    '구르망':  {bg:'#F6DEB6', fg:'#8C4A1B'},
    '스파이시':{bg:'#F8C8A8', fg:'#9A2E14'},
    '허벌':    {bg:'#D9ECCF', fg:'#3F7A2C'},
    '파우더리':{bg:'#F7DDE6', fg:'#A8396A'},
    '레더':    {bg:'#DFCFC1', fg:'#5B3A24'},
    '스모키':  {bg:'#D8DEDF', fg:'#3E5560'},
    '그린':    {bg:'#D4E6C8', fg:'#2F6B35'},
    '푸제르':  {bg:'#D6E4F5', fg:'#1A4A8A'},
    '시프레':  {bg:'#EAEBC4', fg:'#5C7520'},
    '발사믹':  {bg:'#F5D8C2', fg:'#8C3D15'},
    '아이리스':{bg:'#DCD0EF', fg:'#4A2A8F'},
  };

  // Placeholder bottle silhouettes as inline data-URI SVG (soft color per family)
  const bottle = (hex) => `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 150'>
      <rect width='120' height='150' fill='${hex}'/>
      <g transform='translate(60 80)'>
        <rect x='-20' y='-40' width='40' height='12' fill='#1A2E24' opacity='.35' rx='2'/>
        <rect x='-24' y='-28' width='48' height='6' fill='#1A2E24' opacity='.25' rx='1'/>
        <rect x='-28' y='-22' width='56' height='54' fill='#1A2E24' opacity='.18' rx='4'/>
      </g>
    </svg>`
  )}`;

  const PERFUMES = [
    {id:'p1', brand:'BYREDO', name:'Gypsy Water', nameKo:'집시 워터',
     price:265000, rating:4.7, reviews:1240, niche:true, img:bottle('#EFEBE9'),
     tags:['우디','허벌'], usage:['데이트','일상용'], season:['봄','가을'],
     notes:{top:['레몬','베르가못','주니퍼 베리'], mid:['인센스','소나무','오리스'], base:['앰버','샌달우드','바닐라']},
     desc:'집시의 자유로움을 담은 우디 허벌 향. 따뜻한 바닐라와 샌달우드가 포근한 여운을 남깁니다.'},
    {id:'p2', brand:'JO MALONE LONDON', name:'Peony & Blush Suede', nameKo:'피오니 앤 블러쉬 스웨이드',
     price:198000, rating:4.5, reviews:2890, niche:true, img:bottle('#FCE4EC'),
     tags:['플로럴','파우더리'], usage:['데이트','선물'], season:['봄','여름'],
     notes:{top:['레드 애플'], mid:['피오니','카네이션','자스민','로즈'], base:['스웨이드']},
     desc:'봄 정원의 피오니가 스웨이드의 부드러움 위로 피어나는 로맨틱한 향.'},
    {id:'p3', brand:'TOM FORD', name:'Oud Wood', nameKo:'우드 우드',
     price:420000, rating:4.8, reviews:560, niche:true, img:bottle('#EFEBE9'),
     tags:['우디','스모키'], usage:['데이트','직장·비즈니스'], season:['가을','겨울'],
     notes:{top:['로즈우드','카다멈','중국 후추'], mid:['우드','시베리아 파인','샌달우드'], base:['통카빈','바닐라','앰버']},
     desc:'희귀한 오우드와 로즈우드가 만들어내는 럭셔리한 스모키 우드 향.'},
    {id:'p4', brand:'DIPTYQUE', name:'Philosykos', nameKo:'필로시코스',
     price:215000, rating:4.6, reviews:890, niche:true, img:bottle('#E8F5E9'),
     tags:['그린','우디'], usage:['일상용'], season:['여름','봄'],
     notes:{top:['무화과 잎'], mid:['코코넛 밀크','무화과'], base:['시더','화이트 우드']},
     desc:'지중해의 무화과 나무 아래 서 있는 듯한 싱그럽고 그린한 향.'},
    {id:'p5', brand:'MAISON MARGIELA', name:'By the Fireplace', nameKo:'바이 더 파이어플레이스',
     price:238000, rating:4.7, reviews:1120, niche:true, img:bottle('#FFF3E0'),
     tags:['우디','구르망'], usage:['데이트'], season:['겨울','가을'],
     notes:{top:['핑크 페퍼','오렌지 블라섬','클로브'], mid:['체스트넛','거나이아크 우드','밤'], base:['바닐라','페루 발삼','캐시미어 우드']},
     desc:'겨울 밤의 벽난로 곁, 구운 밤과 따뜻한 바닐라의 포근함.'},
    {id:'p6', brand:'LE LABO', name:'Santal 33', nameKo:'산탈 33',
     price:310000, rating:4.6, reviews:2100, niche:true, img:bottle('#EFEBE9'),
     tags:['우디','레더'], usage:['일상용','직장·비즈니스'], season:['가을','겨울'],
     notes:{top:['바이올렛','카다멈'], mid:['아이리스','앰브록스','파피루스'], base:['샌달우드','시더','레더']},
     desc:'아메리칸 웨스트의 광활함을 담은 시그니처 샌달우드 향.'},
  ];

  const BRANDS = [
    {name:'Jo Malone', tag:'니치', subscribed:true},
    {name:'Byredo', tag:'니치'},
    {name:'Tom Ford', tag:'니치·명품'},
    {name:'Diptyque', tag:'니치'},
    {name:'Maison Margiela', tag:'니치'},
    {name:'Le Labo', tag:'니치'},
    {name:'Chanel', tag:'명품'},
    {name:'Dior', tag:'명품'},
  ];

  const BANNERS = [
    {title:'Maison Margiela\nReplica 시리즈', sub:'2025 봄 한정판 신규 입하', badge:'신규 팝업'},
    {title:'Jo Malone London\n플레그런스 위크', sub:'베스트 셀러 10% 할인', badge:'이벤트'},
    {title:'지금 가장 사랑받는\n우디 향수 모음', sub:'에디터가 직접 고른 7선', badge:'에디터 추천'},
  ];

  const REVIEWS = [
    {id:'r1', user:'향덕후_미소', rating:5, date:'2025.03.12', text:'따뜻한 바닐라와 앰버가 포근해요. 가을 저녁에 뿌리기 좋은 향.', usage:'데이트', helpful:42},
    {id:'r2', user:'scent_j', rating:4, date:'2025.02.28', text:'지속력은 무난. 중반 이후 우디노트가 매력적이에요.', usage:'일상용', helpful:18},
    {id:'r3', user:'민트초코', rating:5, date:'2025.02.10', text:'남녀 공용으로 부담 없어요. 선물로도 추천!', usage:'선물', helpful:31},
  ];

  return {SCENT_COLORS, PERFUMES, BRANDS, BANNERS, REVIEWS};
})();
