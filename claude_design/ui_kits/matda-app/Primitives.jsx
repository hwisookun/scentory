// Shared UI primitives: TopBar, TabBar, Chip, HyangiAvatar, PerfumeCard, EventBanner, Icon
// Uses the evolved 맡다. design system (pastel 연두 primary, serif logotype, editorial banner, chibi mascot)
const S = {
  // Brand
  primary:     '#A8D5BA',   // Pastel 연두 — hero
  primaryMid:  '#BCE0CA',   // Lighter stop for gradients
  primaryDark: '#6FB88F',   // Selected chips, text-on-white where pastel washes out
  primaryInk:  '#3E7E62',   // Small uppercase labels, icon active, brand eyebrow
  primaryDeep: '#1F3A2A',   // Deepest wordmark ink
  primaryLight:'#D4EDE0',
  secondary:   '#F0F8F3',
  accent:      '#FFB3A1',   // Pastel coral
  accentInk:   '#FF8A70',   // Saturated coral (wishlist filled)

  // Surfaces / ink
  bg:'#F7FAF8', white:'#FFFFFF',
  text:'#1A2E24', textSec:'#6B7C75', textLight:'#8A9C95',
  border:'#E0EBE5',
  gray100:'#F4F6F5', gray200:'#E8EDEA', gray300:'#D4DDD8',

  // Shadows — warm, tinted with text ink
  shadowSm:'0 1px 4px rgba(26,46,36,.06)',
  shadowMd:'0 4px 8px rgba(26,46,36,.10)',
  shadowLg:'0 8px 16px rgba(26,46,36,.15)',
  shadowPrimary:'0 6px 14px rgba(111,184,143,.35)',
  shadowCoral:  '0 6px 14px rgba(255,138,112,.30)',

  // Font stacks
  fontSans:"'Pretendard', -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
  fontSerif:"'Nanum Myeongjo', 'Noto Serif KR', 'Playfair Display', Georgia, serif",
};

// Inline SVG icon, stroke inherits currentColor
function Icon({name, size=22, solid=false, color}){
  const p = {
    search:'M10.5 3a7.5 7.5 0 015.9 12.13l4.74 4.73-1.41 1.41-4.73-4.74A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z',
    heart: solid
      ? 'M12 21s-7-4.5-7-10a4.5 4.5 0 017.1-3.6A4.5 4.5 0 0119 11c0 5.5-7 10-7 10z'
      : 'M16.5 4.5a4.5 4.5 0 014.5 4.5c0 5.5-9 12-9 12S3 15 3 9a4.5 4.5 0 018.5-2A4.5 4.5 0 0116.5 4.5zm0 2a2.5 2.5 0 00-2.2 1.3L12 9.4l-2.3-1.6a2.5 2.5 0 10-3.2 3.5l5.5 5.9 5.5-5.9A2.5 2.5 0 0016.5 6.5z',
    leaf: solid
      ? 'M21 3s-9-.5-14 4.5c-3 3-2.5 8-1 10 1.2 1.5 5 1.5 8-1 4-3.5 7-13.5 7-13.5zM3 21c1-3 3-6 6-8'
      : 'M20 4c-8-.5-13 4-13 10 0 1 .2 1.8.5 2.5L3 21l1.4 1.4 4.5-4.5c.7.3 1.5.5 2.5.5 6 0 10.5-5 10-13z',
    chat:'M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2h-9l-5 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2z',
    person:'M12 2a5 5 0 015 5 5 5 0 01-10 0 5 5 0 015-5zm0 12c4.4 0 8 2.7 8 6v2H4v-2c0-3.3 3.6-6 8-6z',
    notif:'M12 2a6 6 0 016 6v4l2 3H4l2-3V8a6 6 0 016-6zm0 20a2.5 2.5 0 01-2.5-2.5h5A2.5 2.5 0 0112 22z',
    back:'M20 11H7.8l4.9-4.9L11.3 4.7 4 12l7.3 7.3 1.4-1.4-4.9-4.9H20z',
    chevR:'M9 6l6 6-6 6',
    close:'M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z',
    star:'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2 2 9.3l6.9-1z',
    starOutline:'M12 15.9l3.8 2 -.7-4.2 3-3-4.2-.6L12 6.3l-1.9 3.8-4.2.6 3 3-.7 4.2zm0 2.3l-5.1 2.7 1-5.7L3.7 11 9.4 10 12 4.9 14.6 10l5.7.8-4.1 4.1 1 5.7z',
    send:'M2 21l21-9L2 3v7l15 2-15 2z',
    sort:'M3 6h18v2H3V6m3 5h12v2H6v-2m3 5h6v2H9v-2z',
    plus:'M12 5v14M5 12h14',
    filter:'M3 5h18l-7 8v6l-4 2v-8z',
    arrowR:'M5 12h14M13 6l6 6-6 6',
  };
  const d = p[name] || '';
  const isStroke = ['chevR','plus','arrowR'].includes(name);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      style={{color: color || 'currentColor', flexShrink:0}}
      fill={isStroke?'none':'currentColor'}
      stroke={isStroke?'currentColor':'none'}
      strokeWidth={isStroke?2:0} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// Serif logotype: 맡(green) + 다(deep) + filled green droplet period
function Logotype({size=28}){
  return (
    <span style={{fontFamily:S.fontSerif,fontWeight:900,fontSize:size,letterSpacing:-1.2,
      lineHeight:1,color:S.primaryDeep,display:'inline-flex',alignItems:'baseline'}}>
      <span style={{color:S.primaryInk}}>맡</span>다
      <span style={{display:'inline-block',width:size*0.2,height:size*0.2,
        background:S.primaryInk,borderRadius:9999,marginLeft:2,
        boxShadow:'0 2px 0 rgba(31,58,42,.8)',transform:'translateY(0)'}}/>
    </span>
  );
}

function TopBar({title, logo, right, onBack}){
  return (
    <div style={{padding:'8px 16px 12px',display:'flex',alignItems:'center',gap:8,background:S.bg,flexShrink:0,minHeight:44}}>
      {onBack && (
        <button onClick={onBack} style={{background:'none',border:'none',padding:8,cursor:'pointer',color:S.text,display:'flex'}}>
          <Icon name="back" size={22}/>
        </button>
      )}
      {logo
        ? <span style={{flex:1}}><Logotype size={26}/></span>
        : <span style={{fontSize:20,fontWeight:800,color:S.text,flex:1}}>{title}</span>}
      {right && <div style={{display:'flex',gap:4}}>{right}</div>}
    </div>
  );
}

function TabBar({active, onChange}){
  const tabs = [
    {id:'explore', label:'찾아보기', icon:'search'},
    {id:'wishlist', label:'위시리스트', icon:'heart'},
    {id:'community', label:'커뮤니티', icon:'chat'},
    {id:'chatbot', label:'향이', icon:'leaf'},
    {id:'mypage', label:'마이페이지', icon:'person'},
  ];
  return (
    <div style={{display:'flex',background:S.white,borderTop:`1px solid ${S.border}`,
      paddingTop:8,paddingBottom:24,boxShadow:S.shadowMd,flexShrink:0}}>
      {tabs.map(t => {
        const isActive = active === t.id;
        const color = isActive ? S.primaryDark : S.textLight;
        return (
          <button key={t.id} onClick={()=>onChange(t.id)}
            style={{flex:1,background:'none',border:'none',padding:'6px 4px',cursor:'pointer',
              display:'flex',flexDirection:'column',alignItems:'center',gap:3,color}}>
            <Icon name={t.icon} size={22} solid={isActive && t.id!=='chat'}/>
            <span style={{fontSize:10,fontWeight:isActive?700:500}}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Idle: white + 1.5 border. Selected: primary-dark fill (pastel is too light for white text).
function Chip({children, selected, onClick, sub}){
  return (
    <button onClick={onClick}
      style={{display:'inline-flex',alignItems:'center',gap:4,whiteSpace:'nowrap',
        padding:'9px 16px',borderRadius:9999,
        background:selected?S.primaryDark:S.white,
        border:`1.5px solid ${selected?S.primaryDark:S.border}`,
        color:selected?'#fff':S.text, fontSize:13, fontWeight:selected?700:600,
        boxShadow:selected?'none':S.shadowSm, cursor:'pointer',fontFamily:'inherit',minHeight:40,
        transition:'all .15s'}}>
      {children}
      {sub && (
        <span style={{fontSize:9,fontWeight:700,padding:'1px 4px',borderRadius:4,
          background:selected?'rgba(255,255,255,.25)':S.secondary,
          color:selected?'#fff':S.primaryInk}}>{sub}</span>
      )}
    </button>
  );
}

// 향이 mascot — Sanrio-style egg with leaf on head. Flat colors, thick outline.
// Optional bob animation + sparkles around.
function HyangiAvatar({size=44, bob=false, sparkles=false}){
  const id = React.useId().replace(/:/g,'');
  const bobKey = `hy${id}`;
  const floatKey = `fl${id}`;
  return (
    <div style={{position:'relative',width:size,height:size,flexShrink:0,display:'inline-block'}}>
      <style>{`
        @keyframes ${bobKey}{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-${Math.max(2,size*0.04)}px) rotate(1deg)}}
        @keyframes ${floatKey}{0%,100%{transform:translateY(0) scale(1);opacity:.75}50%{transform:translateY(-6px) scale(1.2);opacity:1}}
      `}</style>

      {sparkles && (
        <>
          <svg viewBox="0 0 14 14" style={{position:'absolute',width:size*0.14,height:size*0.14,top:'8%',left:'4%',animation:`${floatKey} 4s ease-in-out infinite`}}>
            <path d="M7 0 L8 5 L14 7 L8 9 L7 14 L6 9 L0 7 L6 5 Z" fill="#5A9E72"/>
          </svg>
          <svg viewBox="0 0 14 14" style={{position:'absolute',width:size*0.12,height:size*0.12,top:'26%',right:'2%',animation:`${floatKey} 4s ease-in-out .8s infinite`}}>
            <path d="M7 0 L8 5 L14 7 L8 9 L7 14 L6 9 L0 7 L6 5 Z" fill="#3F7A53"/>
          </svg>
          <svg viewBox="0 0 14 14" style={{position:'absolute',width:size*0.12,height:size*0.12,bottom:'18%',left:'2%',animation:`${floatKey} 4s ease-in-out 1.6s infinite`}}>
            <path d="M7 0 L8 5 L14 7 L8 9 L7 14 L6 9 L0 7 L6 5 Z" fill="#A8D5BA"/>
          </svg>
        </>
      )}

      <svg viewBox="0 0 200 200" width="100%" height="100%"
        style={{display:'block',overflow:'visible',
          filter:`drop-shadow(0 ${Math.max(2,size*0.06)}px ${Math.max(3,size*0.1)}px rgba(31,58,42,.18))`,
          animation: bob ? `${bobKey} 3.2s ease-in-out infinite` : 'none',
          transformOrigin:'center'}}>
        {/* floor shadow */}
        <ellipse cx="100" cy="186" rx="48" ry="5" fill="#1F3A2A" opacity=".12"/>
        {/* egg body — flat fill, thick outline */}
        <path d="M100 28 C 56 28, 30 70, 30 118 C 30 162, 58 188, 100 188 C 142 188, 170 162, 170 118 C 170 70, 144 28, 100 28 Z"
          fill="#F2FBF5" stroke="#1F3A2A" strokeWidth="3.6"/>
        {/* leaf on head — stem + leaf + vein */}
        <g transform="translate(100 26)">
          <path d="M0 4 Q -2 -2 2 -8" stroke="#1F3A2A" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M2 -8 Q 22 -16 22 -2 Q 14 6 2 -8 Z" fill="#7DBE91" stroke="#1F3A2A" strokeWidth="3" strokeLinejoin="round"/>
          <path d="M4 -7 Q 12 -5 20 -3" stroke="#1F3A2A" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity=".5"/>
        </g>
        {/* blush */}
        <circle cx="60" cy="118" r="10" fill="#FFB3A1" opacity=".85"/>
        <circle cx="140" cy="118" r="10" fill="#FFB3A1" opacity=".85"/>
        {/* eye dots */}
        <circle cx="78" cy="106" r="7" fill="#1F3A2A"/>
        <circle cx="122" cy="106" r="7" fill="#1F3A2A"/>
        {/* smile */}
        <path d="M93 128 Q 100 138 107 128" stroke="#1F3A2A" strokeWidth="3.6" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function ScentTag({name, small}){
  const c = MATDA_DATA.SCENT_COLORS[name] || {bg:S.gray200,fg:S.textSec};
  return (
    <span style={{display:'inline-block',background:c.bg,color:c.fg,
      fontSize:small?10:11, fontWeight:700, padding:small?'2px 7px':'4px 9px', borderRadius:9999}}>
      {name}
    </span>
  );
}

// Illustrated bottle silhouette — matches preview/perfume-card.html
function BottleGlyph({accent='rgba(31,74,53,.22)', size=58}){
  const h = Math.round(size*1.45);
  return (
    <div style={{width:size,height:h,position:'relative',flexShrink:0}}>
      <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',
        width:size*0.48,height:size*0.17,background:'rgba(31,74,53,.55)',borderRadius:3}}/>
      <div style={{position:'absolute',top:size*0.17,left:'50%',transform:'translateX(-50%)',
        width:size*0.58,height:size*0.09,background:'rgba(31,74,53,.35)',borderRadius:1}}/>
      <div style={{position:'absolute',top:size*0.24,left:'50%',transform:'translateX(-50%)',
        width:size*0.90,height:size*1.20,background:accent,borderRadius:8}}/>
      <div style={{position:'absolute',top:size*0.34,left:size*0.14,
        width:size*0.17,height:size*0.82,background:'#fff',opacity:.45,borderRadius:9999,filter:'blur(1px)'}}/>
    </div>
  );
}

// Perfume card — illustrated bottle on pastel mint background, brand eyebrow UPPERCASE,
// Korean + EDP/EDC subtitle, scent tags, divider, rating + count on left, price label
// "50ml" above price on right.
function PerfumeCard({perfume, liked, onLike, onClick, size='md'}){
  const w = size==='sm' ? 168 : (size==='lg' ? 230 : 200);
  const imgH = size==='sm' ? 150 : (size==='lg' ? 200 : 176);
  const bottleSz = size==='sm' ? 50 : (size==='lg' ? 68 : 58);
  const tagAccent = (() => {
    const t = perfume.tags && perfume.tags[0];
    const c = t && MATDA_DATA.SCENT_COLORS[t];
    if (!c) return 'rgba(31,74,53,.22)';
    // use the tag's foreground color at low opacity as the glass tint
    return c.fg.length===7 ? `${c.fg}38` : 'rgba(31,74,53,.22)';
  })();
  // Korean name fallback
  const ko = perfume.nameKo || '';
  const conc = perfume.concentration || (perfume.niche ? 'EDP' : 'EDT');
  const volume = perfume.volume || '50ml';
  const ratingCount = perfume.reviews
    ? (perfume.reviews >= 1000 ? (perfume.reviews/1000).toFixed(1)+'k' : perfume.reviews)
    : null;

  return (
    <div onClick={onClick} style={{background:S.white,borderRadius:22,overflow:'hidden',
      boxShadow:'0 1px 2px rgba(46,64,54,.04), 0 8px 18px rgba(46,64,54,.06)',
      width:w,flexShrink:0,cursor:'pointer',
      border:'1px solid rgba(111,184,143,.10)',
      transition:'transform .2s ease, box-shadow .2s ease'}}>
      <div style={{height:imgH,
        background:'linear-gradient(145deg, #F0F8F3 0%, #DCF1E2 100%)',
        position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <BottleGlyph accent={tagAccent} size={bottleSz}/>
        {perfume.niche && (
          <span style={{position:'absolute',top:10,left:10,
            background:'#5A9E72',color:'#fff',fontSize:10,fontWeight:800,
            padding:'4px 8px',borderRadius:8,letterSpacing:.3,
            boxShadow:'0 2px 4px rgba(63,122,44,.2)'}}>니치</span>
        )}
        <button onClick={e=>{e.stopPropagation();onLike&&onLike();}}
          style={{position:'absolute',top:10,right:10,
            background:'#fff',width:32,height:32,borderRadius:9999,
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 2px 6px rgba(46,64,54,.12)',cursor:'pointer',border:'none',
            color: liked ? S.accentInk : '#B0BDB8'}}>
          <Icon name="heart" size={16} solid={liked}/>
        </button>
      </div>

      <div style={{padding:'14px 14px'}}>
        <div style={{fontSize:10,color:S.primaryInk,fontWeight:800,textTransform:'uppercase',
          letterSpacing:.7,marginBottom:5}}>{perfume.brand}</div>
        <div style={{fontSize:15,fontWeight:800,color:S.text,lineHeight:1.3,letterSpacing:-.3,
          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{perfume.name}</div>
        <div style={{fontSize:11,color:S.textLight,fontWeight:500,marginTop:2,marginBottom:10,
          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
          {ko ? `${ko} · ${conc}` : conc}
        </div>

        <div style={{display:'flex',gap:4,marginBottom:12,flexWrap:'wrap'}}>
          {perfume.tags.slice(0,2).map(t => <ScentTag key={t} name={t} small/>)}
        </div>

        <div style={{height:1,background:'#EBF2EE',margin:'0 -14px 10px'}}/>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:10}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:3,
            fontSize:11,color:S.textSec,fontWeight:700,paddingBottom:1}}>
            <span style={{color:'#FFB800',fontSize:12}}>★</span>{perfume.rating}
            {ratingCount && <span style={{color:'#B0BDB8',fontWeight:500}}>({ratingCount})</span>}
          </span>
          <div style={{textAlign:'right',marginLeft:'auto'}}>
            <span style={{display:'block',fontSize:9,fontWeight:700,color:S.textLight,
              letterSpacing:.5,textTransform:'uppercase',marginBottom:1}}>{volume}</span>
            <span style={{fontSize:16,fontWeight:900,color:S.text,letterSpacing:-.4,lineHeight:1,
              whiteSpace:'nowrap'}}>
              {perfume.price.toLocaleString()}
              <small style={{fontSize:11,fontWeight:700,color:S.textSec,marginLeft:1}}>원</small>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Editorial event banner — deep navy/plum base, overlay-grain, frosted badge,
// ghosted bottle silhouette, pastel-peach pill CTA.
function EventBanner({banner}){
  return (
    <div style={{
      position:'relative',
      background:`linear-gradient(135deg, #1E2A44 0%, #3E6890 100%)`,
      borderRadius:24, padding:'22px 24px', color:'#fff', boxShadow:S.shadowMd,
      minHeight:160, overflow:'hidden',
      display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
      {/* darkening scrim on left */}
      <div style={{position:'absolute',inset:0,
        background:'linear-gradient(90deg, rgba(0,0,0,.30) 0%, rgba(0,0,0,0) 60%)',pointerEvents:'none'}}/>
      {/* overlay grain dot pattern */}
      <div style={{position:'absolute',inset:0,
        backgroundImage:'radial-gradient(rgba(255,255,255,.35) 1px, transparent 1.2px)',
        backgroundSize:'7px 7px',mixBlendMode:'overlay',opacity:.15,pointerEvents:'none'}}/>
      {/* ghosted bottle silhouette */}
      <svg viewBox="0 0 100 100" style={{position:'absolute',right:-18,bottom:-20,width:170,height:170,
        opacity:.11,transform:'rotate(-6deg)',pointerEvents:'none'}} aria-hidden>
        <rect x="40" y="10" width="20" height="10" rx="2" fill="#fff"/>
        <rect x="43" y="20" width="14" height="6" fill="#fff"/>
        <path d="M30 34 Q30 28 36 28 L64 28 Q70 28 70 34 L72 82 Q72 92 62 92 L38 92 Q28 92 28 82 Z" fill="#fff"/>
      </svg>
      {/* content */}
      <div style={{position:'relative',zIndex:2}}>
        <span style={{
          display:'inline-block',
          background:'rgba(255,255,255,.14)',
          border:'1px solid rgba(255,255,255,.35)',
          backdropFilter:'blur(10px)',
          WebkitBackdropFilter:'blur(10px)',
          fontSize:10,fontWeight:700, letterSpacing:.4,
          padding:'4px 10px',borderRadius:9999}}>{banner.badge}</span>
        <div style={{fontSize:19,fontWeight:900,letterSpacing:-.4,lineHeight:1.3,
          marginTop:12,whiteSpace:'pre-line',textShadow:'0 1px 2px rgba(0,0,0,.25)'}}>{banner.title}</div>
        <div style={{fontSize:12,opacity:.85,marginTop:4}}>{banner.sub}</div>
      </div>
      {/* peach pill CTA bottom right */}
      <div style={{position:'relative',zIndex:2,alignSelf:'flex-end',marginTop:8}}>
        <button style={{
          display:'inline-flex',alignItems:'center',gap:8,
          background:'#FFDAC9', color:'#1E2A44',
          border:'none', borderRadius:9999, padding:'8px 10px 8px 16px',
          fontSize:12,fontWeight:800,fontFamily:'inherit',cursor:'pointer',
          boxShadow:'0 4px 10px rgba(0,0,0,.25)'}}>
          지금 보러가기
          <span style={{width:26,height:26,borderRadius:9999,background:'#1E2A44',color:'#FFDAC9',
            display:'inline-flex',alignItems:'center',justifyContent:'center'}}>
            <Icon name="arrowR" size={14}/>
          </span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {S, Icon, Logotype, TopBar, TabBar, Chip, HyangiAvatar, ScentTag, PerfumeCard, EventBanner});
