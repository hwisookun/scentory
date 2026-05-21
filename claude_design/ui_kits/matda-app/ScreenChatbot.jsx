// Chatbot (향이)
function ScreenChatbot() {
  const [messages, setMessages] = React.useState([
    {id:1, from:'bot', text:'안녕하세요! 저는 향이예요 🌿\n향수에 대해 뭐든 물어보세요.'},
    {id:2, from:'bot', text:'어떤 향을 찾고 계세요? 계절, 분위기, 원료… 자유롭게 말해주세요.'},
  ]);
  const [draft, setDraft] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  function send() {
    if (!draft.trim()) return;
    const userMsg = {id:Date.now(), from:'user', text:draft.trim()};
    setMessages(m => [...m, userMsg]);
    const asked = draft.trim();
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = [
        '음, 말씀해주신 느낌이라면 Byredo의 Gypsy Water 어떠세요? 바닐라와 샌달우드가 따뜻해요 🍂',
        '데이트용이라면 Jo Malone의 피오니 앤 블러쉬 스웨이드를 추천드려요. 부드러운 플로럴이 매력적이에요.',
        '그 계절엔 디프티크 필로시코스가 정말 잘 어울려요. 싱그러운 무화과 잎 향이 인상적이랍니다.',
      ];
      const reply = replies[Math.floor(Math.random()*replies.length)];
      setMessages(m => [...m, {id:Date.now()+1, from:'bot', text:reply}]);
    }, 900);
  }

  const suggestions = ['오늘 날씨에 맞는 향','데이트용 EDP','봄에 어울리는 향'];

  return (
    <React.Fragment>
      <TopBar title="향이" right={null}/>
      <div ref={scrollRef} style={{flex:1,overflowY:'auto',padding:'4px 16px 12px',background:S.bg}}>
        {messages.map(m => (
          <Bubble key={m.id} from={m.from}>{m.text}</Bubble>
        ))}
        {typing && <Bubble from="bot"><Dots/></Bubble>}
      </div>

      {messages.length <= 2 && (
        <div style={{padding:'0 16px 10px',display:'flex',gap:6,overflowX:'auto',scrollbarWidth:'none',flexShrink:0}}>
          {suggestions.map(s => (
            <button key={s} onClick={()=>{setDraft(s); setTimeout(send,10);}}
              style={{background:S.white,border:`1px solid ${S.border}`,padding:'8px 14px',
                borderRadius:9999,fontSize:12,fontWeight:600,color:S.primaryInk,cursor:'pointer',
                whiteSpace:'nowrap',fontFamily:'inherit',boxShadow:S.shadowSm}}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{padding:'10px 16px 12px',background:S.white,borderTop:`1px solid ${S.border}`,
        display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
        <input value={draft} onChange={e=>setDraft(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="메시지를 입력하세요"
          style={{flex:1,border:'none',outline:'none',background:S.gray100,padding:'12px 16px',
            borderRadius:9999,fontSize:14,fontFamily:'inherit',color:S.text,minHeight:40,boxSizing:'border-box'}}/>
        <button onClick={send} disabled={!draft.trim()}
          style={{width:40,height:40,borderRadius:9999,border:'none',
            background: draft.trim() ? S.primaryDark : S.gray300,
            color:'#fff',cursor:draft.trim()?'pointer':'default',display:'flex',
            alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <Icon name="send" size={18}/>
        </button>
      </div>
    </React.Fragment>
  );
}

function Bubble({from, children}) {
  const isBot = from === 'bot';
  return (
    <div style={{display:'flex',gap:8,alignItems:'flex-end',marginBottom:10,
      flexDirection:isBot?'row':'row-reverse'}}>
      {isBot && <HyangiAvatar size={30}/>}
      <div style={{maxWidth:'76%',padding:'10px 14px',borderRadius:16,
        whiteSpace:'pre-line',lineHeight:1.5,fontSize:14,
        background: isBot ? S.white : S.primaryDark,
        color: isBot ? S.text : '#fff',
        borderBottomLeftRadius: isBot ? 4 : 16,
        borderBottomRightRadius: isBot ? 16 : 4,
        boxShadow: isBot ? S.shadowSm : 'none'}}>
        {children}
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span style={{display:'inline-flex',gap:4,padding:'2px 0'}}>
      {[0,1,2].map(i=>(
        <span key={i} style={{width:6,height:6,borderRadius:9999,background:S.textLight,
          animation:`dot 1.2s infinite ${i*.2}s`}}/>
      ))}
      <style>{`@keyframes dot { 0%,60%,100%{opacity:.3} 30%{opacity:1} }`}</style>
    </span>
  );
}

Object.assign(window, {ScreenChatbot, Bubble, Dots});
