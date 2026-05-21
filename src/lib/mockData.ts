import { Perfume, Brand, Review, ScentorySpot } from '../types';

const IMG = (seed: string) => `https://picsum.photos/seed/${seed}/400/500`;

export const MOCK_BRANDS: Brand[] = [
  { id: '1',  name: 'Chanel',            priceRange: '150k_300k', isNiche: false, country: '프랑스', official_url: 'https://www.chanel.com' },
  { id: '2',  name: 'Dior',              priceRange: '150k_300k', isNiche: false, country: '프랑스', official_url: 'https://www.dior.com' },
  { id: '3',  name: 'Tom Ford',          priceRange: 'over300k',  isNiche: true,  country: '미국',   official_url: 'https://www.tomford.com' },
  { id: '4',  name: 'Jo Malone',         priceRange: '150k_300k', isNiche: false, country: '영국',   official_url: 'https://www.jomalone.com' },
  { id: '5',  name: 'Hermès',            priceRange: '150k_300k', isNiche: false, country: '프랑스', official_url: 'https://www.hermes.com' },
  { id: '6',  name: 'YSL',               priceRange: '50k_150k',  isNiche: false, country: '프랑스', official_url: 'https://www.yslbeauty.com' },
  { id: '7',  name: 'Giorgio Armani',    priceRange: '50k_150k',  isNiche: false, country: '이탈리아', official_url: 'https://www.giorgioarmanibeauty.com' },
  { id: '8',  name: 'Versace',           priceRange: '50k_150k',  isNiche: false, country: '이탈리아', official_url: 'https://www.versace.com' },
  { id: '9',  name: 'Dolce & Gabbana',   priceRange: '50k_150k',  isNiche: false, country: '이탈리아', official_url: 'https://www.dolcegabbana.com' },
  { id: '10', name: 'Prada',             priceRange: '150k_300k', isNiche: false, country: '이탈리아', official_url: 'https://www.prada.com' },
  { id: '11', name: 'Guerlain',          priceRange: '150k_300k', isNiche: false, country: '프랑스', official_url: 'https://www.guerlain.com' },
  { id: '12', name: 'Givenchy',          priceRange: '50k_150k',  isNiche: false, country: '프랑스', official_url: 'https://www.givenchy.com' },
  { id: '13', name: 'Burberry',          priceRange: '50k_150k',  isNiche: false, country: '영국',   official_url: 'https://www.burberry.com' },
  { id: '14', name: 'Calvin Klein',      priceRange: 'under50k',  isNiche: false, country: '미국',   official_url: 'https://www.calvinklein.com' },
  { id: '15', name: 'Maison Margiela',   priceRange: 'over300k',  isNiche: true,  country: '프랑스', official_url: 'https://www.maisonmargiela.com' },
  { id: '16', name: 'Byredo',            priceRange: 'over300k',  isNiche: true,  country: '스웨덴', official_url: 'https://www.byredo.com' },
  { id: '17', name: 'Diptyque',          priceRange: 'over300k',  isNiche: true,  country: '프랑스', official_url: 'https://www.diptyqueparis.com' },
  { id: '18', name: 'Creed',             priceRange: 'over300k',  isNiche: true,  country: '영국',   official_url: 'https://www.creedperfume.com' },
  { id: '19', name: 'Le Labo',           priceRange: 'over300k',  isNiche: true,  country: '미국',   official_url: 'https://www.lelabofragrances.com' },
  { id: '20', name: 'Parfums de Marly',  priceRange: 'over300k',  isNiche: true,  country: '프랑스', official_url: 'https://www.parfumsdemarly.com' },
];

const b = (id: string) => MOCK_BRANDS.find(br => br.id === id)!;

export const MOCK_PERFUMES: Perfume[] = [
  // ── CHANEL ──
  { id: 'c1', name: 'No. 5', brand: b('1'), brand_id: '1', concentration: 'EDP', top_notes: ['알데히드','네롤리','일랑일랑'], middle_notes: ['장미','자스민','아이리스'], base_notes: ['시벳','베티버','바닐라','샌달우드'], tags: ['플로럴','머스크'], price_krw: 185000, rating: 4.6, review_count: 3241, gender: '여성', image_url: IMG('chanel5'), created_at: '2024-01-01' },
  { id: 'c2', name: 'Coco Mademoiselle', brand: b('1'), brand_id: '1', concentration: 'EDP', top_notes: ['오렌지','베르가못'], middle_notes: ['장미','재스민','미모사'], base_notes: ['파출리','머스크','바닐라'], tags: ['플로럴','오리엔탈'], price_krw: 195000, rating: 4.7, review_count: 2890, gender: '여성', image_url: IMG('cocomademoiselle'), created_at: '2024-01-01' },
  { id: 'c3', name: 'Bleu de Chanel', brand: b('1'), brand_id: '1', concentration: 'EDP', top_notes: ['자몽','레몬','민트'], middle_notes: ['생강','넛메그','재스민'], base_notes: ['샌달우드','파출리','시다우드'], tags: ['우디','프레시'], price_krw: 175000, rating: 4.8, review_count: 4120, gender: '남성', image_url: IMG('bleuchanel'), created_at: '2024-01-01' },
  { id: 'c4', name: 'Chance Eau Tendre', brand: b('1'), brand_id: '1', concentration: 'EDT', top_notes: ['자몽','퀸스'], middle_notes: ['히아신스','아이리스'], base_notes: ['머스크','앰버'], tags: ['플로럴','프레시'], price_krw: 165000, rating: 4.5, review_count: 1980, gender: '여성', image_url: IMG('chanceeau'), created_at: '2024-01-01' },
  { id: 'c5', name: 'Gabrielle', brand: b('1'), brand_id: '1', concentration: 'EDP', top_notes: ['만다린','블랙커런트'], middle_notes: ['튜베로즈','재스민','오렌지 블라썸'], base_notes: ['머스크','시다우드'], tags: ['플로럴','프레시'], price_krw: 190000, rating: 4.4, review_count: 1240, gender: '여성', image_url: IMG('gabrielle'), created_at: '2024-01-01' },

  // ── DIOR ──
  { id: 'd1', name: 'Sauvage', brand: b('2'), brand_id: '2', concentration: 'EDT', top_notes: ['베르가못','페퍼'], middle_notes: ['라벤더','핑크페퍼','시칠리아 페퍼'], base_notes: ['아미리스','시다우드','라브다넘'], tags: ['우디','프레시'], price_krw: 148000, rating: 4.8, review_count: 5200, gender: '남성', image_url: IMG('sauvage'), created_at: '2024-01-01' },
  { id: 'd2', name: 'Miss Dior', brand: b('2'), brand_id: '2', concentration: 'EDP', top_notes: ['블러드 오렌지','로즈'], middle_notes: ['다마스크 로즈','피오니'], base_notes: ['파출리','머스크'], tags: ['플로럴','프레시'], price_krw: 162000, rating: 4.6, review_count: 2750, gender: '여성', image_url: IMG('missdior'), created_at: '2024-01-01' },
  { id: 'd3', name: "J'adore", brand: b('2'), brand_id: '2', concentration: 'EDP', top_notes: ['멜론','피치','베르가못'], middle_notes: ['다마스크 로즈','일랑일랑','바이올렛'], base_notes: ['머스크','블랙베리','시벳'], tags: ['플로럴','오리엔탈'], price_krw: 175000, rating: 4.5, review_count: 2100, gender: '여성', image_url: IMG('jadore'), created_at: '2024-01-01' },
  { id: 'd4', name: 'Dior Homme Intense', brand: b('2'), brand_id: '2', concentration: 'EDP', top_notes: ['라벤더','베르가못'], middle_notes: ['아이리스','앰브레트'], base_notes: ['바닐라','시다우드','파출리'], tags: ['파우더리','우디'], price_krw: 155000, rating: 4.6, review_count: 1830, gender: '남성', image_url: IMG('diorhomme'), created_at: '2024-01-01' },
  { id: 'd5', name: 'Fahrenheit', brand: b('2'), brand_id: '2', concentration: 'EDT', top_notes: ['레몬','라벤더','카모마일'], middle_notes: ['시다우드','너트메그'], base_notes: ['머스크','앰버','레더'], tags: ['레더','우디'], price_krw: 132000, rating: 4.3, review_count: 1450, gender: '남성', image_url: IMG('fahrenheit'), created_at: '2024-01-01' },

  // ── TOM FORD ──
  { id: 'tf1', name: 'Black Orchid', brand: b('3'), brand_id: '3', concentration: 'Parfum', top_notes: ['블랙 트러플','일랑일랑'], middle_notes: ['블랙 오키드','로터스 우드'], base_notes: ['파출리','바닐라','베티버'], tags: ['오리엔탈','플로럴'], price_krw: 325000, rating: 4.6, review_count: 980, gender: '유니섹스', image_url: IMG('blackorchid'), created_at: '2024-01-01' },
  { id: 'tf2', name: 'Tobacco Vanille', brand: b('3'), brand_id: '3', concentration: 'EDP', top_notes: ['담배 잎','향신료'], middle_notes: ['바닐라','통카빈'], base_notes: ['건조 과일','우드'], tags: ['오리엔탈','구르망'], price_krw: 340000, rating: 4.7, review_count: 1120, gender: '유니섹스', image_url: IMG('tobaccovanille'), created_at: '2024-01-01' },
  { id: 'tf3', name: 'Oud Wood', brand: b('3'), brand_id: '3', concentration: 'EDP', top_notes: ['로즈우드','카다멈'], middle_notes: ['아가우드','샌달우드'], base_notes: ['베티버','앰버','통카빈'], tags: ['우디','오리엔탈'], price_krw: 350000, rating: 4.7, review_count: 890, gender: '유니섹스', image_url: IMG('oudwood'), created_at: '2024-01-01' },
  { id: 'tf4', name: 'Lost Cherry', brand: b('3'), brand_id: '3', concentration: 'EDP', top_notes: ['블랙체리','피망'], middle_notes: ['투르크 로즈','재스민'], base_notes: ['앰브록산','통카빈','베티버'], tags: ['오리엔탈','구르망'], price_krw: 360000, rating: 4.5, review_count: 760, gender: '유니섹스', image_url: IMG('lostcherry'), created_at: '2024-01-01' },
  { id: 'tf5', name: 'Neroli Portofino', brand: b('3'), brand_id: '3', concentration: 'EDT', top_notes: ['네롤리','만다린','레몬'], middle_notes: ['로즈우드','라벤더'], base_notes: ['앰브록산','머스크'], tags: ['시트러스','프레시'], price_krw: 310000, rating: 4.4, review_count: 540, gender: '유니섹스', image_url: IMG('neroli'), created_at: '2024-01-01' },

  // ── JO MALONE ──
  { id: 'jm1', name: 'Wood Sage & Sea Salt', brand: b('4'), brand_id: '4', concentration: 'EDC', top_notes: ['시 솔트','아마리스'], middle_notes: ['세이지'], base_notes: ['드리프트우드','앰브록산'], tags: ['아쿠아틱','우디'], price_krw: 145000, rating: 4.4, review_count: 1230, gender: '유니섹스', image_url: IMG('woodsage'), created_at: '2024-01-01' },
  { id: 'jm2', name: 'Peony & Blush Suede', brand: b('4'), brand_id: '4', concentration: 'EDC', top_notes: ['레드 애플'], middle_notes: ['피오니','재스민'], base_notes: ['스웨이드'], tags: ['플로럴','파우더리'], price_krw: 140000, rating: 4.5, review_count: 1560, gender: '여성', image_url: IMG('peonysuede'), created_at: '2024-01-01' },
  { id: 'jm3', name: 'Lime Basil & Mandarin', brand: b('4'), brand_id: '4', concentration: 'EDC', top_notes: ['라임','만다린'], middle_notes: ['바질','타임'], base_notes: ['화이트 머스크','앰버'], tags: ['시트러스','허벌'], price_krw: 135000, rating: 4.3, review_count: 980, gender: '유니섹스', image_url: IMG('limebasil'), created_at: '2024-01-01' },
  { id: 'jm4', name: 'English Pear & Freesia', brand: b('4'), brand_id: '4', concentration: 'EDC', top_notes: ['잉글리시 페어'], middle_notes: ['프리지아','로즈'], base_notes: ['파출리','라브다넘'], tags: ['플로럴','프레시'], price_krw: 138000, rating: 4.6, review_count: 2100, gender: '여성', image_url: IMG('pearfreesia'), created_at: '2024-01-01' },
  { id: 'jm5', name: 'Myrrh & Tonka', brand: b('4'), brand_id: '4', concentration: 'EDC', top_notes: ['헬리오트로프','라벤더'], middle_notes: ['몰약'], base_notes: ['통카빈','벤조인'], tags: ['오리엔탈','발사믹'], price_krw: 142000, rating: 4.4, review_count: 720, gender: '유니섹스', image_url: IMG('myrrhtonka'), created_at: '2024-01-01' },

  // ── HERMÈS ──
  { id: 'h1', name: "Terre d'Hermès", brand: b('5'), brand_id: '5', concentration: 'EDT', top_notes: ['오렌지','자몽'], middle_notes: ['페퍼','제라늄'], base_notes: ['베티버','시다우드','파출리'], tags: ['우디','시트러스'], price_krw: 168000, rating: 4.7, review_count: 2400, gender: '남성', image_url: IMG('terrehermes'), created_at: '2024-01-01' },
  { id: 'h2', name: 'Jour d\'Hermès', brand: b('5'), brand_id: '5', concentration: 'EDP', top_notes: ['화이트 리스트로사'], middle_notes: ['소렐','화이트 로즈'], base_notes: ['머스크'], tags: ['플로럴','프레시'], price_krw: 172000, rating: 4.4, review_count: 980, gender: '여성', image_url: IMG('jourhermes'), created_at: '2024-01-01' },
  { id: 'h3', name: 'Twilly d\'Hermès', brand: b('5'), brand_id: '5', concentration: 'EDP', top_notes: ['진저'], middle_notes: ['튜베로즈','오스만투스'], base_notes: ['샌달우드'], tags: ['플로럴','스파이시'], price_krw: 175000, rating: 4.5, review_count: 1340, gender: '여성', image_url: IMG('twillyhermes'), created_at: '2024-01-01' },
  { id: 'h4', name: 'Un Jardin Sur Le Nil', brand: b('5'), brand_id: '5', concentration: 'EDT', top_notes: ['피오니','망고'], middle_notes: ['로터스','시커모어'], base_notes: ['시더','시커모어우드'], tags: ['프레시','플로럴'], price_krw: 162000, rating: 4.3, review_count: 720, gender: '유니섹스', image_url: IMG('jardinnile'), created_at: '2024-01-01' },
  { id: 'h5', name: 'H24', brand: b('5'), brand_id: '5', concentration: 'EDT', top_notes: ['클라리 세이지','엘레미'], middle_notes: ['녹색 식물성'], base_notes: ['네롤리 우드','머스크'], tags: ['그린','우디'], price_krw: 158000, rating: 4.2, review_count: 540, gender: '남성', image_url: IMG('h24hermes'), created_at: '2024-01-01' },

  // ── YSL ──
  { id: 'y1', name: 'Black Opium', brand: b('6'), brand_id: '6', concentration: 'EDP', top_notes: ['핑크 페퍼','오렌지 블라썸'], middle_notes: ['재스민','커피'], base_notes: ['바닐라','파출리','시다우드'], tags: ['오리엔탈','구르망'], price_krw: 125000, rating: 4.7, review_count: 3800, gender: '여성', image_url: IMG('blackopium'), created_at: '2024-01-01' },
  { id: 'y2', name: 'Libre', brand: b('6'), brand_id: '6', concentration: 'EDP', top_notes: ['만다린','블랙커런트 향'], middle_notes: ['라벤더','오렌지 블라썸'], base_notes: ['머스크','바닐라','앰버'], tags: ['플로럴','오리엔탈'], price_krw: 132000, rating: 4.6, review_count: 2100, gender: '여성', image_url: IMG('libreYsl'), created_at: '2024-01-01' },
  { id: 'y3', name: 'La Nuit de l\'Homme', brand: b('6'), brand_id: '6', concentration: 'EDT', top_notes: ['카다멈','라벤더'], middle_notes: ['버지니아 시다우드','코리앤더'], base_notes: ['베티버','통카빈'], tags: ['우디','스파이시'], price_krw: 112000, rating: 4.5, review_count: 1920, gender: '남성', image_url: IMG('lanuitYsl'), created_at: '2024-01-01' },
  { id: 'y4', name: 'Mon Paris', brand: b('6'), brand_id: '6', concentration: 'EDP', top_notes: ['라즈베리','피어'], middle_notes: ['피오니','달리아'], base_notes: ['머스크','파출리'], tags: ['플로럴','프레시'], price_krw: 118000, rating: 4.4, review_count: 1600, gender: '여성', image_url: IMG('monparis'), created_at: '2024-01-01' },
  { id: 'y5', name: 'Y', brand: b('6'), brand_id: '6', concentration: 'EDP', top_notes: ['베르가못','진저'], middle_notes: ['제라늄','세이지'], base_notes: ['시다우드','통카빈','앰버'], tags: ['우디','프레시'], price_krw: 110000, rating: 4.3, review_count: 1200, gender: '남성', image_url: IMG('yYsl'), created_at: '2024-01-01' },

  // ── GIORGIO ARMANI ──
  { id: 'ga1', name: 'Acqua di Giò', brand: b('7'), brand_id: '7', concentration: 'EDT', top_notes: ['시칠리아 레몬','라임','베르가못'], middle_notes: ['시 워터','재스민'], base_notes: ['머스크','파출리','시다우드'], tags: ['아쿠아틱','프레시'], price_krw: 98000, rating: 4.6, review_count: 4500, gender: '남성', image_url: IMG('acquagio'), created_at: '2024-01-01' },
  { id: 'ga2', name: 'Sì', brand: b('7'), brand_id: '7', concentration: 'EDP', top_notes: ['블랙커런트'], middle_notes: ['장미','프리지아'], base_notes: ['파출리','바닐라','머스크'], tags: ['플로럴','오리엔탈'], price_krw: 112000, rating: 4.5, review_count: 2300, gender: '여성', image_url: IMG('siArmani'), created_at: '2024-01-01' },
  { id: 'ga3', name: 'Code Homme', brand: b('7'), brand_id: '7', concentration: 'EDT', top_notes: ['베르가못','레몬'], middle_notes: ['올리브 블라썸','통카빈'], base_notes: ['과이악 우드','앰버','레더'], tags: ['우디','오리엔탈'], price_krw: 95000, rating: 4.4, review_count: 1800, gender: '남성', image_url: IMG('codeArmani'), created_at: '2024-01-01' },
  { id: 'ga4', name: 'Stronger With You', brand: b('7'), brand_id: '7', concentration: 'EDT', top_notes: ['핑크 페퍼','카다멈'], middle_notes: ['바이올렛','세이지'], base_notes: ['바닐라','통카빈','시다우드'], tags: ['우디','스파이시'], price_krw: 102000, rating: 4.5, review_count: 2100, gender: '남성', image_url: IMG('strongerArmani'), created_at: '2024-01-01' },
  { id: 'ga5', name: 'My Way', brand: b('7'), brand_id: '7', concentration: 'EDP', top_notes: ['베르가못','오렌지 블라썸'], middle_notes: ['튜베로즈','인디안 재스민'], base_notes: ['화이트 머스크','시다우드','바닐라'], tags: ['플로럴','프레시'], price_krw: 108000, rating: 4.4, review_count: 1560, gender: '여성', image_url: IMG('mywayArmani'), created_at: '2024-01-01' },

  // ── VERSACE ──
  { id: 'v1', name: 'Eros', brand: b('8'), brand_id: '8', concentration: 'EDT', top_notes: ['민트','이탈리아 레몬','그린 애플'], middle_notes: ['통카빈','앰브록산','제라늄'], base_notes: ['바닐라','베티버','오크 모스'], tags: ['프레시','우디'], price_krw: 88000, rating: 4.5, review_count: 3200, gender: '남성', image_url: IMG('erosVersace'), created_at: '2024-01-01' },
  { id: 'v2', name: 'Dylan Blue', brand: b('8'), brand_id: '8', concentration: 'EDT', top_notes: ['자몽','아쿠아 워터','피그 리프'], middle_notes: ['바이올렛 리프','페퍼','파출리'], base_notes: ['인센스','머스크','앰버'], tags: ['아쿠아틱','우디'], price_krw: 85000, rating: 4.3, review_count: 1900, gender: '남성', image_url: IMG('dylanblue'), created_at: '2024-01-01' },
  { id: 'v3', name: 'Bright Crystal', brand: b('8'), brand_id: '8', concentration: 'EDT', top_notes: ['자몽','유즈','블라드 연꽃'], middle_notes: ['피오니','마그놀리아'], base_notes: ['머스크','앰버'], tags: ['플로럴','프레시'], price_krw: 82000, rating: 4.4, review_count: 2200, gender: '여성', image_url: IMG('brightcrystal'), created_at: '2024-01-01' },
  { id: 'v4', name: 'Crystal Noir', brand: b('8'), brand_id: '8', concentration: 'EDT', top_notes: ['진저','카다멈','페퍼'], middle_notes: ['가르데니아','코코넛','피오니'], base_notes: ['앰버','머스크','샌달우드'], tags: ['오리엔탈','플로럴'], price_krw: 84000, rating: 4.3, review_count: 1100, gender: '여성', image_url: IMG('crystalnoir'), created_at: '2024-01-01' },
  { id: 'v5', name: 'Pour Femme', brand: b('8'), brand_id: '8', concentration: 'EDP', top_notes: ['베르가못','네롤리'], middle_notes: ['장미','아이리스'], base_notes: ['샌달우드','머스크','앰버'], tags: ['플로럴','파우더리'], price_krw: 86000, rating: 4.2, review_count: 880, gender: '여성', image_url: IMG('pourFemmeVersace'), created_at: '2024-01-01' },

  // ── DOLCE & GABBANA ──
  { id: 'dg1', name: 'Light Blue', brand: b('9'), brand_id: '9', concentration: 'EDT', top_notes: ['시칠리아 레몬','애플','시다'], middle_notes: ['밤부','시클라멘','자스민'], base_notes: ['시다 우드','앰버','머스크'], tags: ['아쿠아틱','프레시'], price_krw: 92000, rating: 4.6, review_count: 3800, gender: '여성', image_url: IMG('lightblue'), created_at: '2024-01-01' },
  { id: 'dg2', name: 'The One', brand: b('9'), brand_id: '9', concentration: 'EDP', top_notes: ['자몽','베르가못','바질'], middle_notes: ['진저','카다멈','오렌지 블라썸'], base_notes: ['앰버','머스크','샌달우드'], tags: ['오리엔탈','스파이시'], price_krw: 110000, rating: 4.5, review_count: 2400, gender: '남성', image_url: IMG('theone'), created_at: '2024-01-01' },
  { id: 'dg3', name: 'Dolce', brand: b('9'), brand_id: '9', concentration: 'EDP', top_notes: ['네롤리','파파야'], middle_notes: ['화이트 아마릴리스','화이트 로즈'], base_notes: ['캐시미어 우드','머스크'], tags: ['플로럴','프레시'], price_krw: 106000, rating: 4.4, review_count: 1200, gender: '여성', image_url: IMG('dolceDG'), created_at: '2024-01-01' },
  { id: 'dg4', name: 'Pour L\'Homme', brand: b('9'), brand_id: '9', concentration: 'EDT', top_notes: ['시트러스','라벤더'], middle_notes: ['세이지','바질'], base_notes: ['샌달우드','파출리'], tags: ['프레시','허벌'], price_krw: 88000, rating: 4.2, review_count: 960, gender: '남성', image_url: IMG('pourHomme'), created_at: '2024-01-01' },
  { id: 'dg5', name: 'K', brand: b('9'), brand_id: '9', concentration: 'EDP', top_notes: ['아피옴','베르가못'], middle_notes: ['진저','카다멈'], base_notes: ['레더','베티버','파출리'], tags: ['우디','스파이시'], price_krw: 114000, rating: 4.3, review_count: 780, gender: '남성', image_url: IMG('kDolce'), created_at: '2024-01-01' },

  // ── PRADA ──
  { id: 'p1', name: 'La Femme', brand: b('10'), brand_id: '10', concentration: 'EDP', top_notes: ['일랑일랑'], middle_notes: ['피오니','튤립'], base_notes: ['바닐라','샌달우드'], tags: ['플로럴','파우더리'], price_krw: 158000, rating: 4.3, review_count: 980, gender: '여성', image_url: IMG('lafemmePrada'), created_at: '2024-01-01' },
  { id: 'p2', name: 'L\'Homme', brand: b('10'), brand_id: '10', concentration: 'EDT', top_notes: ['아이리스','앰버우드'], middle_notes: ['아이리스 앱솔루트'], base_notes: ['베티버','파출리'], tags: ['파우더리','우디'], price_krw: 148000, rating: 4.4, review_count: 1340, gender: '남성', image_url: IMG('lhommePrada'), created_at: '2024-01-01' },
  { id: 'p3', name: 'Candy', brand: b('10'), brand_id: '10', concentration: 'EDP', top_notes: ['카라멜'], middle_notes: ['파우더리 머스크'], base_notes: ['바닐라','벤조인'], tags: ['구르망','오리엔탈'], price_krw: 145000, rating: 4.5, review_count: 1680, gender: '여성', image_url: IMG('candyPrada'), created_at: '2024-01-01' },
  { id: 'p4', name: 'Infusion d\'Iris', brand: b('10'), brand_id: '10', concentration: 'EDP', top_notes: ['오렌지 블라썸','만다린'], middle_notes: ['아이리스'], base_notes: ['시다우드','인센스'], tags: ['플로럴','파우더리'], price_krw: 162000, rating: 4.4, review_count: 760, gender: '여성', image_url: IMG('infusioniris'), created_at: '2024-01-01' },
  { id: 'p5', name: 'Luna Rossa Carbon', brand: b('10'), brand_id: '10', concentration: 'EDT', top_notes: ['베르가못','시트러스'], middle_notes: ['라벤더','진저'], base_notes: ['앰브록산','시다우드'], tags: ['프레시','우디'], price_krw: 140000, rating: 4.3, review_count: 890, gender: '남성', image_url: IMG('lunaCarbonPrada'), created_at: '2024-01-01' },

  // ── GUERLAIN ──
  { id: 'gu1', name: 'Shalimar', brand: b('11'), brand_id: '11', concentration: 'EDP', top_notes: ['베르가못','레몬'], middle_notes: ['아이리스','재스민','장미'], base_notes: ['바닐라','오포포낙스','레더'], tags: ['오리엔탈','발사믹'], price_krw: 168000, rating: 4.4, review_count: 1420, gender: '여성', image_url: IMG('shalimar'), created_at: '2024-01-01' },
  { id: 'gu2', name: 'Mon Guerlain', brand: b('11'), brand_id: '11', concentration: 'EDP', top_notes: ['라벤더','베르가못'], middle_notes: ['자스민','쿠마린'], base_notes: ['바닐라','샌달우드','머스크'], tags: ['플로럴','머스크'], price_krw: 148000, rating: 4.3, review_count: 1890, gender: '여성', image_url: IMG('monguerlain'), created_at: '2024-01-01' },
  { id: 'gu3', name: 'La Petite Robe Noire', brand: b('11'), brand_id: '11', concentration: 'EDP', top_notes: ['블랙커런트','체리','아몬드'], middle_notes: ['티 로즈','아이리스'], base_notes: ['패츌리','머스크','화이트 머스크'], tags: ['플로럴','구르망'], price_krw: 155000, rating: 4.5, review_count: 2100, gender: '여성', image_url: IMG('petiterobenoire'), created_at: '2024-01-01' },
  { id: 'gu4', name: 'Habit Rouge', brand: b('11'), brand_id: '11', concentration: 'EDP', top_notes: ['베르가못','레몬','오렌지'], middle_notes: ['제라늄','카네이션'], base_notes: ['바닐라','샌달우드','파출리'], tags: ['오리엔탈','발사믹'], price_krw: 162000, rating: 4.4, review_count: 720, gender: '남성', image_url: IMG('habitrouge'), created_at: '2024-01-01' },
  { id: 'gu5', name: 'L\'Homme Idéal', brand: b('11'), brand_id: '11', concentration: 'EDP', top_notes: ['레몬','알데히드'], middle_notes: ['아이리스','아몬드'], base_notes: ['통카빈','바닐라','샌달우드'], tags: ['파우더리','오리엔탈'], price_krw: 145000, rating: 4.3, review_count: 840, gender: '남성', image_url: IMG('lhommeIdeal'), created_at: '2024-01-01' },

  // ── GIVENCHY ──
  { id: 'gi1', name: "L'Interdit", brand: b('12'), brand_id: '12', concentration: 'EDP', top_notes: ['알데히드','오렌지 블라썸'], middle_notes: ['재스민','튜베로즈'], base_notes: ['파출리','베티버','앰버'], tags: ['플로럴','파우더리'], price_krw: 118000, rating: 4.4, review_count: 1680, gender: '여성', image_url: IMG('linterdit'), created_at: '2024-01-01' },
  { id: 'gi2', name: 'Gentleman', brand: b('12'), brand_id: '12', concentration: 'EDP', top_notes: ['페어','레몬'], middle_notes: ['아이리스','제라늄'], base_notes: ['베티버','파출리'], tags: ['파우더리','우디'], price_krw: 115000, rating: 4.3, review_count: 1200, gender: '남성', image_url: IMG('gentleman'), created_at: '2024-01-01' },
  { id: 'gi3', name: 'Irresistible', brand: b('12'), brand_id: '12', concentration: 'EDP', top_notes: ['라즈베리','쥬시 피어'], middle_notes: ['다마스크 로즈'], base_notes: ['머스크'], tags: ['플로럴','프레시'], price_krw: 112000, rating: 4.4, review_count: 1450, gender: '여성', image_url: IMG('irresistible'), created_at: '2024-01-01' },
  { id: 'gi4', name: 'Pi', brand: b('12'), brand_id: '12', concentration: 'EDT', top_notes: ['만다린','시트러스'], middle_notes: ['네롤리','바닐라'], base_notes: ['통카빈','앰버'], tags: ['오리엔탈','발사믹'], price_krw: 105000, rating: 4.2, review_count: 760, gender: '남성', image_url: IMG('piGivenchy'), created_at: '2024-01-01' },
  { id: 'gi5', name: 'Amarige', brand: b('12'), brand_id: '12', concentration: 'EDT', top_notes: ['오렌지 블라썸','미모사'], middle_notes: ['가르데니아','일랑일랑','바이올렛'], base_notes: ['머스크','바닐라','샌달우드'], tags: ['플로럴','파우더리'], price_krw: 108000, rating: 4.1, review_count: 620, gender: '여성', image_url: IMG('amarige'), created_at: '2024-01-01' },

  // ── BURBERRY ──
  { id: 'bu1', name: 'Her', brand: b('13'), brand_id: '13', concentration: 'EDP', top_notes: ['블랙커런트','라즈베리','스트로베리'], middle_notes: ['바이올렛','재스민'], base_notes: ['앰버','드라이 무스크'], tags: ['플로럴','프레시'], price_krw: 95000, rating: 4.4, review_count: 1980, gender: '여성', image_url: IMG('herBurberry'), created_at: '2024-01-01' },
  { id: 'bu2', name: 'Mr. Burberry', brand: b('13'), brand_id: '13', concentration: 'EDT', top_notes: ['자몽','타임'], middle_notes: ['버치우드'], base_notes: ['베티버'], tags: ['우디','프레시'], price_krw: 92000, rating: 4.2, review_count: 1100, gender: '남성', image_url: IMG('mrBurberry'), created_at: '2024-01-01' },
  { id: 'bu3', name: 'Brit Rhythm', brand: b('13'), brand_id: '13', concentration: 'EDT', top_notes: ['타임','바질'], middle_notes: ['인디고 우드'], base_notes: ['앰버우드'], tags: ['우디','허벌'], price_krw: 86000, rating: 4.1, review_count: 760, gender: '남성', image_url: IMG('britRhythm'), created_at: '2024-01-01' },
  { id: 'bu4', name: 'Goddess', brand: b('13'), brand_id: '13', concentration: 'EDP', top_notes: ['라벤더'], middle_notes: ['라벤더 허니'], base_notes: ['캐시미어 우드','머스크'], tags: ['플로럴','발사믹'], price_krw: 98000, rating: 4.3, review_count: 920, gender: '여성', image_url: IMG('goddessBurberry'), created_at: '2024-01-01' },
  { id: 'bu5', name: 'Weekend For Women', brand: b('13'), brand_id: '13', concentration: 'EDT', top_notes: ['자몽','만다린'], middle_notes: ['피오니','시클라멘'], base_notes: ['머스크','샌달우드'], tags: ['플로럴','시트러스'], price_krw: 88000, rating: 4.2, review_count: 840, gender: '여성', image_url: IMG('weekendBurberry'), created_at: '2024-01-01' },

  // ── CALVIN KLEIN ──
  { id: 'ck1', name: 'CK One', brand: b('14'), brand_id: '14', concentration: 'EDT', top_notes: ['파인애플','만다린','파파야'], middle_notes: ['뮤게','바이올렛','오르키드'], base_notes: ['머스크','앰버','오크모스'], tags: ['프레시','아쿠아틱'], price_krw: 48000, rating: 4.2, review_count: 5600, gender: '유니섹스', image_url: IMG('ckone'), created_at: '2024-01-01' },
  { id: 'ck2', name: 'Eternity', brand: b('14'), brand_id: '14', concentration: 'EDP', top_notes: ['프리지아','세이지'], middle_notes: ['화이트 로즈','릴리'], base_notes: ['머스크','샌달우드','앰버'], tags: ['플로럴','프레시'], price_krw: 52000, rating: 4.1, review_count: 2800, gender: '여성', image_url: IMG('eternity'), created_at: '2024-01-01' },
  { id: 'ck3', name: 'Obsession', brand: b('14'), brand_id: '14', concentration: 'EDP', top_notes: ['오렌지','베르가못'], middle_notes: ['오렌지 블라썸','스파이스'], base_notes: ['바닐라','앰버','머스크'], tags: ['오리엔탈','발사믹'], price_krw: 46000, rating: 4.0, review_count: 1900, gender: '여성', image_url: IMG('obsession'), created_at: '2024-01-01' },
  { id: 'ck4', name: 'Euphoria', brand: b('14'), brand_id: '14', concentration: 'EDP', top_notes: ['자두','딸기'], middle_notes: ['오키드','블랙 바이올렛'], base_notes: ['체스트넛','크림','머스크'], tags: ['오리엔탈','플로럴'], price_krw: 50000, rating: 4.2, review_count: 2300, gender: '여성', image_url: IMG('euphoriaCK'), created_at: '2024-01-01' },
  { id: 'ck5', name: 'Defy', brand: b('14'), brand_id: '14', concentration: 'EDT', top_notes: ['시트러스','자몽','베르가못'], middle_notes: ['바이올렛 리프'], base_notes: ['드라이 우드','앰버'], tags: ['프레시','우디'], price_krw: 55000, rating: 4.3, review_count: 1100, gender: '남성', image_url: IMG('defyCK'), created_at: '2024-01-01' },

  // ── MAISON MARGIELA ──
  { id: 'mm1', name: 'Replica Jazz Club', brand: b('15'), brand_id: '15', concentration: 'EDT', top_notes: ['럼','베르가못','레몬'], middle_notes: ['자스민','네롤리'], base_notes: ['모카','베티버','바닐라','화이트 머스크'], tags: ['구르망','우디'], price_krw: 215000, rating: 4.5, review_count: 1890, gender: '유니섹스', image_url: IMG('jazzclub'), created_at: '2024-01-01' },
  { id: 'mm2', name: 'By The Fireplace', brand: b('15'), brand_id: '15', concentration: 'EDT', top_notes: ['클로브','체스트넛'], middle_notes: ['바이올렛','과이악 우드'], base_notes: ['바닐라','머스크','인센스'], tags: ['우디','스모키'], price_krw: 210000, rating: 4.7, review_count: 2340, gender: '유니섹스', image_url: IMG('bythefireplace'), created_at: '2024-01-01' },
  { id: 'mm3', name: 'Flower Market', brand: b('15'), brand_id: '15', concentration: 'EDT', top_notes: ['네롤리'], middle_notes: ['장미','뮤게'], base_notes: ['머스크','시다우드'], tags: ['플로럴','프레시'], price_krw: 205000, rating: 4.3, review_count: 980, gender: '유니섹스', image_url: IMG('flowermarket'), created_at: '2024-01-01' },
  { id: 'mm4', name: 'Beach Walk', brand: b('15'), brand_id: '15', concentration: 'EDT', top_notes: ['시트러스','코코넛'], middle_notes: ['아이리스'], base_notes: ['머스크','샌달우드'], tags: ['아쿠아틱','프레시'], price_krw: 208000, rating: 4.4, review_count: 1120, gender: '유니섹스', image_url: IMG('beachwalk'), created_at: '2024-01-01' },
  { id: 'mm5', name: 'Lazy Sunday Morning', brand: b('15'), brand_id: '15', concentration: 'EDT', top_notes: ['알데히드'], middle_notes: ['아이리스','릴리','장미'], base_notes: ['머스크'], tags: ['플로럴','파우더리'], price_krw: 205000, rating: 4.4, review_count: 1380, gender: '유니섹스', image_url: IMG('lazysunday'), created_at: '2024-01-01' },

  // ── BYREDO ──
  { id: 'by1', name: 'Mojave Ghost', brand: b('16'), brand_id: '16', concentration: 'EDP', top_notes: ['아마렛토','마그놀리아'], middle_notes: ['네롤리','바이올렛','우드'], base_notes: ['샌달우드','시다우드','크리스탈리스'], tags: ['플로럴','우디'], price_krw: 248000, rating: 4.5, review_count: 1240, gender: '유니섹스', image_url: IMG('mojaveGhost'), created_at: '2024-01-01' },
  { id: 'by2', name: 'Gypsy Water', brand: b('16'), brand_id: '16', concentration: 'EDP', top_notes: ['베르가못','레몬','닐 오크'], middle_notes: ['주니퍼 베리','시다우드'], base_notes: ['바닐라','파인','인센스'], tags: ['우디','시프레'], price_krw: 255000, rating: 4.4, review_count: 980, gender: '유니섹스', image_url: IMG('gypsyWater'), created_at: '2024-01-01' },
  { id: 'by3', name: 'Bal d\'Afrique', brand: b('16'), brand_id: '16', concentration: 'EDP', top_notes: ['아프리카 마리골드'], middle_notes: ['바이올렛','시다우드'], base_notes: ['앰브록산','머스크'], tags: ['플로럴','우디'], price_krw: 252000, rating: 4.6, review_count: 1120, gender: '유니섹스', image_url: IMG('baldafrique'), created_at: '2024-01-01' },
  { id: 'by4', name: 'Bibliothèque', brand: b('16'), brand_id: '16', concentration: 'EDP', top_notes: ['피치','플럼'], middle_notes: ['피오니','바이올렛'], base_notes: ['통카빈','바닐라'], tags: ['오리엔탈','플로럴'], price_krw: 260000, rating: 4.5, review_count: 840, gender: '유니섹스', image_url: IMG('bibliotheque'), created_at: '2024-01-01' },
  { id: 'by5', name: 'Super Cedar', brand: b('16'), brand_id: '16', concentration: 'EDP', top_notes: ['로즈워터'], middle_notes: ['시다우드'], base_notes: ['앰브록산'], tags: ['우디','프레시'], price_krw: 245000, rating: 4.2, review_count: 680, gender: '유니섹스', image_url: IMG('superceder'), created_at: '2024-01-01' },

  // ── DIPTYQUE ──
  { id: 'dp1', name: 'Philosykos', brand: b('17'), brand_id: '17', concentration: 'EDT', top_notes: ['피그 리프'], middle_notes: ['피그 우드'], base_notes: ['크리미 화이트 시다'], tags: ['그린','우디'], price_krw: 182000, rating: 4.5, review_count: 1560, gender: '유니섹스', image_url: IMG('philosykos'), created_at: '2024-01-01' },
  { id: 'dp2', name: 'Tam Dao', brand: b('17'), brand_id: '17', concentration: 'EDT', top_notes: ['사이프러스','미르틀'], middle_notes: ['샌달우드','로즈우드'], base_notes: ['화이트 머스크','시다'], tags: ['우디','시프레'], price_krw: 178000, rating: 4.4, review_count: 980, gender: '유니섹스', image_url: IMG('tamdao'), created_at: '2024-01-01' },
  { id: 'dp3', name: "L'Ombre dans l'Eau", brand: b('17'), brand_id: '17', concentration: 'EDT', top_notes: ['블랙커런트','그린 노트'], middle_notes: ['로즈','다마스크 로즈'], base_notes: ['베티버','앰버'], tags: ['플로럴','프레시'], price_krw: 175000, rating: 4.3, review_count: 760, gender: '여성', image_url: IMG('lombredanseau'), created_at: '2024-01-01' },
  { id: 'dp4', name: 'Do Son', brand: b('17'), brand_id: '17', concentration: 'EDT', top_notes: ['만다린','베르가못'], middle_notes: ['튜베로즈','아이리스'], base_notes: ['머스크','앰버'], tags: ['플로럴','파우더리'], price_krw: 172000, rating: 4.2, review_count: 620, gender: '여성', image_url: IMG('doson'), created_at: '2024-01-01' },
  { id: 'dp5', name: 'Eau Rose', brand: b('17'), brand_id: '17', concentration: 'EDT', top_notes: ['리치'], middle_notes: ['로즈','베르가못'], base_notes: ['머스크'], tags: ['플로럴','프레시'], price_krw: 168000, rating: 4.3, review_count: 840, gender: '여성', image_url: IMG('eaurose'), created_at: '2024-01-01' },

  // ── CREED ──
  { id: 'cr1', name: 'Aventus', brand: b('18'), brand_id: '18', concentration: 'EDP', top_notes: ['파인애플','버치','블랙커런트','애플'], middle_notes: ['자작나무','파출리','로즈'], base_notes: ['머스크','오크모스','아미리스'], tags: ['시프레','프레시'], price_krw: 480000, rating: 4.8, review_count: 3200, gender: '남성', image_url: IMG('aventus'), created_at: '2024-01-01' },
  { id: 'cr2', name: 'Silver Mountain Water', brand: b('18'), brand_id: '18', concentration: 'EDP', top_notes: ['베르가못','만다린'], middle_notes: ['그린티','블랙커런트'], base_notes: ['머스크','샌달우드'], tags: ['아쿠아틱','프레시'], price_krw: 460000, rating: 4.6, review_count: 1560, gender: '유니섹스', image_url: IMG('silvermountain'), created_at: '2024-01-01' },
  { id: 'cr3', name: 'Green Irish Tweed', brand: b('18'), brand_id: '18', concentration: 'EDP', top_notes: ['레몬 버베나','아이리스'], middle_notes: ['바이올렛 리프','산달우드'], base_notes: ['앰브레트','머스크'], tags: ['그린','프레시'], price_krw: 455000, rating: 4.6, review_count: 1200, gender: '남성', image_url: IMG('greenirish'), created_at: '2024-01-01' },
  { id: 'cr4', name: 'Millesime Imperial', brand: b('18'), brand_id: '18', concentration: 'EDP', top_notes: ['시트러스','아이리스'], middle_notes: ['시 워터'], base_notes: ['머스크'], tags: ['아쿠아틱','시트러스'], price_krw: 470000, rating: 4.7, review_count: 980, gender: '유니섹스', image_url: IMG('millesimeImperial'), created_at: '2024-01-01' },
  { id: 'cr5', name: 'Original Vetiver', brand: b('18'), brand_id: '18', concentration: 'EDP', top_notes: ['레몬','베르가못'], middle_notes: ['너트메그'], base_notes: ['베티버','머스크'], tags: ['우디','허벌'], price_krw: 450000, rating: 4.5, review_count: 760, gender: '남성', image_url: IMG('originalVetiver'), created_at: '2024-01-01' },

  // ── LE LABO ──
  { id: 'll1', name: 'Santal 33', brand: b('19'), brand_id: '19', concentration: 'EDP', top_notes: ['카다멈','아이리스'], middle_notes: ['바이올렛','앰브록산'], base_notes: ['샌달우드','시다','가죽'], tags: ['우디','레더'], price_krw: 360000, rating: 4.8, review_count: 3800, gender: '유니섹스', image_url: IMG('santal33'), created_at: '2024-01-01' },
  { id: 'll2', name: 'Rose 31', brand: b('19'), brand_id: '19', concentration: 'EDP', top_notes: ['쿠민','코리앤더'], middle_notes: ['장미'], base_notes: ['시다우드','머스크','구아약 우드'], tags: ['플로럴','우디'], price_krw: 355000, rating: 4.5, review_count: 1680, gender: '유니섹스', image_url: IMG('rose31'), created_at: '2024-01-01' },
  { id: 'll3', name: 'Another 13', brand: b('19'), brand_id: '19', concentration: 'EDP', top_notes: ['아모시 우드','앰브록산'], middle_notes: ['머스크'], base_notes: ['앰브록산'], tags: ['머스크','우디'], price_krw: 345000, rating: 4.6, review_count: 2100, gender: '유니섹스', image_url: IMG('another13'), created_at: '2024-01-01' },
  { id: 'll4', name: 'Bergamote 22', brand: b('19'), brand_id: '19', concentration: 'EDP', top_notes: ['베르가못','그레이프프루트'], middle_notes: ['플로럴'], base_notes: ['머스크','앰브록산'], tags: ['시트러스','프레시'], price_krw: 340000, rating: 4.4, review_count: 1240, gender: '유니섹스', image_url: IMG('bergamote22'), created_at: '2024-01-01' },
  { id: 'll5', name: 'Noir 29', brand: b('19'), brand_id: '19', concentration: 'EDP', top_notes: ['피그 리프'], middle_notes: ['그린 티'], base_notes: ['시다우드'], tags: ['그린','우디'], price_krw: 350000, rating: 4.5, review_count: 980, gender: '유니섹스', image_url: IMG('noir29'), created_at: '2024-01-01' },

  // ── PARFUMS DE MARLY ──
  { id: 'pm1', name: 'Layton', brand: b('20'), brand_id: '20', concentration: 'EDP', top_notes: ['애플','라벤더'], middle_notes: ['장미','제라늄','바이올렛'], base_notes: ['바닐라','구아약 우드','머스크'], tags: ['플로럴','우디'], price_krw: 385000, rating: 4.8, review_count: 2800, gender: '남성', image_url: IMG('layton'), created_at: '2024-01-01' },
  { id: 'pm2', name: 'Percival', brand: b('20'), brand_id: '20', concentration: 'EDP', top_notes: ['라벤더','베르가못'], middle_notes: ['아이리스','제라늄'], base_notes: ['오크모스','파출리'], tags: ['푸제르','우디'], price_krw: 375000, rating: 4.6, review_count: 1560, gender: '남성', image_url: IMG('percival'), created_at: '2024-01-01' },
  { id: 'pm3', name: 'Delina', brand: b('20'), brand_id: '20', concentration: 'EDP', top_notes: ['리치','라즈베리','로즈'], middle_notes: ['피오니','터키 로즈'], base_notes: ['머스크','베티버','인센스'], tags: ['플로럴','프레시'], price_krw: 380000, rating: 4.7, review_count: 2100, gender: '여성', image_url: IMG('delina'), created_at: '2024-01-01' },
  { id: 'pm4', name: 'Pegasus', brand: b('20'), brand_id: '20', concentration: 'EDP', top_notes: ['헬리오트로프','아몬드','라벤더'], middle_notes: ['통카빈','재스민'], base_notes: ['샌달우드','바닐라','머스크'], tags: ['오리엔탈','파우더리'], price_krw: 370000, rating: 4.5, review_count: 1890, gender: '남성', image_url: IMG('pegasus'), created_at: '2024-01-01' },
  { id: 'pm5', name: 'Herod', brand: b('20'), brand_id: '20', concentration: 'EDP', top_notes: ['페퍼'],middle_notes: ['담배 잎','시나몬'], base_notes: ['바닐라','파출리','머스크'], tags: ['오리엔탈','스파이시'], price_krw: 372000, rating: 4.6, review_count: 1240, gender: '남성', image_url: IMG('herod'), created_at: '2024-01-01' },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', user_id: 'user1', perfume_id: 'c1', rating: 5, comment: '정말 클래식하고 우아한 향이에요. 처음엔 강하게 느껴지지만 시간이 지나면서 부드럽게 변해요.', created_at: '2024-03-15', nickname: '향수러버' },
  { id: 'r2', user_id: 'user2', perfume_id: 'c1', rating: 4, comment: '지속력이 정말 좋아요! 아침에 뿌리고 저녁까지 은은하게 남아있어요.', created_at: '2024-03-10', nickname: '플로럴좋아' },
  { id: 'r3', user_id: 'user3', perfume_id: 'd1', rating: 5, comment: '남자친구가 너무 좋아해요. 처음에 뿌리고 5분 후가 가장 좋은 것 같아요.', created_at: '2024-03-20', nickname: '향수초보' },
  { id: 'r4', user_id: 'user4', perfume_id: 'mm2', rating: 5, comment: '겨울에 너무 잘 어울려요. 따뜻하고 아늑한 느낌. 오래 지속돼서 만족!', created_at: '2024-03-18', nickname: '우디향매니아' },
  { id: 'r5', user_id: 'user5', perfume_id: 'll1', rating: 5, comment: '독보적인 향. 처음엔 낯설었는데 지금은 매일 뿌리고 싶어요.', created_at: '2024-03-22', nickname: '니치향수러버' },
  { id: 'r6', user_id: 'user6', perfume_id: 'cr1', rating: 5, comment: '향수계의 레전드. 배치마다 다르다는 말을 들었는데 제가 구한 건 정말 최고예요.', created_at: '2024-03-25', nickname: '어벤투스팬' },
];

export const MOCK_SPOTS: ScentorySpot[] = [
  { id: 's1', name: '신세계백화점 강남점', address: '서울 서초구 신반포로 176', lat: 37.5049, lng: 127.0046, type: '백화점', is_verified: true },
  { id: 's2', name: '롯데백화점 본점', address: '서울 중구 남대문로 81', lat: 37.5649, lng: 126.9820, type: '백화점', is_verified: true },
  { id: 's3', name: '현대백화점 압구정본점', address: '서울 강남구 압구정로 165', lat: 37.5272, lng: 127.0272, type: '백화점', is_verified: true },
];

export const BRANDS_BY_PRICE: Record<string, Brand[]> = {
  under50k:  MOCK_BRANDS.filter(b => b.priceRange === 'under50k'),
  '50k_150k': MOCK_BRANDS.filter(b => b.priceRange === '50k_150k'),
  '150k_300k': MOCK_BRANDS.filter(b => b.priceRange === '150k_300k'),
  over300k:  MOCK_BRANDS.filter(b => b.priceRange === 'over300k'),
};
