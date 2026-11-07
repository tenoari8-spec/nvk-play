
// Camada de dados: hoje usa localStorage (provisório). Na Etapa 8 será trocada por Supabase mantendo as mesmas funções.
var KEY='nvk:v1',D={profiles:[],ask:true,last:null,catalog:[]},mem=null;
function load(){try{var r=localStorage.getItem(KEY);if(r)D=Object.assign(D,JSON.parse(r))}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}if(typeof scheduleSync==='function')scheduleSync()}
var AV=['🦊','🐼','🦁','🐙','🚀','🎬','🌙','⚡'];
var GR=['#7c6cff,#3b2fd6','#ff7a59,#d6336c','#2ec4b6,#1b7f9e','#f6c344,#e07b00','#6bd16b,#1b8a5a','#ff6bb5,#9b3dff','#5ab0ff,#2d4bd6','#c0c7e6,#5b6490'];
var MAXP=5,view='splash',manage=false,tab='home',cur=null,form=null,msg='';
var $app=document.getElementById('app');
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function av(p,sm,ed){return '<div class="av'+(sm?' s':'')+'" style="background:linear-gradient(135deg,'+GR[p.av]+')">'+AV[p.av]+(p.kids&&!sm?'<span class="kid">KIDS</span>':'')+(ed?'<span class="ed">✎</span>':'')+'</div>'}
function go(v2){view=v2;msg='';render()}

function render(){
  if(view==='add')return renderAdd();
  if(view==='detail')return renderDetail();
  if(view==='ep')return renderEp();
  if(view==='hist')return renderHist();
  if(view==='auth')return renderAuth();
  if(view==='adm')return renderAdm();
  if(view==='admeps')return renderAdmEps();
  if(view==='cfg')return renderCfg();
  if(view==='doc')return renderDoc();
  if(view==='splash'){$app.innerHTML='<div class="splash"><div class="logo"><b>NVK</b><span>PLAY</span></div></div>';return}
  if(view==='pick'){
    var h='<div class="pick"><div class="logo sm"><b>NVK</b><span>PLAY</span></div><h1>Quem está assistindo?</h1>';
    if(!D.profiles.length)h+='<p class="empty">Crie seu primeiro perfil para começar.</p>';
    h+='<div class="grid">';
    D.profiles.forEach(function(p){h+='<button class="pf" data-a="'+(manage?'edit':'enter')+'" data-id="'+p.id+'">'+av(p,false,manage)+'<span class="nm">'+esc(p.name)+'</span></button>'});
    if(D.profiles.length<MAXP)h+='<button class="pf add" data-a="new"><div class="av">+</div><span class="nm">Adicionar perfil</span></button>';
    h+='</div>';
    if(D.profiles.length)h+='<div class="out"><button class="btn" data-a="manage">'+(manage?'Concluído':'Editar perfis')+'</button></div>';
    $app.innerHTML=h+'</div>';return;
  }
  if(view==='form'){
    var f=form,h='<div class="form"><h2>'+(f.id?'Editar perfil':'Novo perfil')+'</h2>';
    h+='<div><label>Nome</label><input type="text" id="nm" maxlength="20" value="'+esc(f.name)+'" placeholder="Nome do perfil" autocomplete="off"></div>';
    h+='<div><label>Avatar</label><div class="avs">';
    AV.forEach(function(e,i){h+='<button data-a="av" data-i="'+i+'" class="'+(f.av===i?'on':'')+'" style="background:linear-gradient(135deg,'+GR[i]+')" aria-label="Avatar '+(i+1)+'">'+e+'</button>'});
    h+='</div></div>';
    h+='<button class="row" data-a="kids" style="text-align:left"><span>Perfil infantil<small>Mostra só conteúdos até a classificação escolhida</small></span><span class="sw'+(f.kids?' on':'')+'"></span></button>';
    if(f.kids){h+='<div><label>Classificação máxima</label><select id="rt">';['L','10','12'].forEach(function(r){h+='<option value="'+r+'"'+(f.rating===r?' selected':'')+'>'+(r==='L'?'Livre':r+' anos')+'</option>'});h+='</select></div>'}else{h+='<div><label>Limite de classificação (opcional)</label><select id="cp">'+[['','Sem limite'],['L','Livre'],['10','Até 10 anos'],['12','Até 12 anos'],['14','Até 14 anos'],['16','Até 16 anos']].map(function(o){return '<option value="'+o[0]+'"'+((f.cap||'')===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></div>'}
    h+='<p class="err" id="er">'+esc(msg)+'</p><div class="acts"><button class="btn" data-a="save">Salvar</button><button class="btn g" data-a="cancel">Cancelar</button></div>';
    if(f.id&&formBack!=='cfg')h+='<button class="btn d" data-a="del">Excluir perfil</button>';
    $app.innerHTML=h+'</div>';return;
  }
  if(view==='shell'){
    var p=cur,h='<div class="top"><div class="who">'+av(p,true)+'<span>'+esc(p.name)+'</span></div><div class="logo sm"><b>NVK</b><span>PLAY</span></div></div><div class="main">';
    if(tab==='home')h+=homeHtml(p);
    if(tab==='explore')h+=exploreHtml(p);
    if(tab==='list')h+=listHtml(p);
    if(tab==='me'){
      h+='<div class="card" style="display:flex;gap:14px;align-items:center">'+av(p)+'<div><h3 style="margin:0">'+esc(p.name)+'</h3><p>'+(p.kids?'Perfil infantil (até '+(p.rating==='L'?'Livre':p.rating+' anos')+')':(p.cap?'Limite de classificação: '+(p.cap==='L'?'Livre':p.cap+' anos'):'Perfil padrão'))+'</p></div></div>';
      h+='<div class="acts" style="flex-direction:column"><button class="btn g" data-h="hist">Histórico</button><button class="btn g" data-z="open">Configurações</button>'+(canAdmin()?'<button class="btn g" data-m="open">Painel administrativo</button>':'')+'<button class="btn" data-a="switch">Trocar perfil</button></div>';
      h+=(CLOUD&&SES?'<p class="cnt" style="margin-top:14px">Conta: '+esc(SES.email||'')+' · Nuvem: '+esc(SYNCST||'conectando...')+'</p>':'<p class="cnt" style="margin-top:14px">Modo local: os dados ficam só neste aparelho.</p>');
    }
    h+='</div><nav><div>';
    [['home','🏠','Início'],['explore','🔍','Explorar'],['list','➕','Minha Lista'],['me','👤','Perfil']].forEach(function(t){h+='<button data-a="tab" data-t="'+t[0]+'" class="'+(tab===t[0]?'on':'')+'"><i>'+t[1]+'</i>'+t[2]+'</button>'});
    $app.innerHTML=h+'</div></nav>';
  }
}

function find(id){return D.profiles.filter(function(p){return p.id===id})[0]}
function saveForm(){
  var n=form.name.trim();
  if(n.length<2){msg='Digite um nome com pelo menos 2 letras.';return render()}
  var dup=D.profiles.some(function(p){return p.id!==form.id&&p.name.toLowerCase()===n.toLowerCase()});
  if(dup){msg='Já existe um perfil com esse nome.';return render()}
  if(form.id){var p=find(form.id);p.name=n;p.av=form.av;p.kids=form.kids;p.rating=form.rating;p.cap=form.kids?null:(form.cap||null)}
  else D.profiles.push({id:'p'+Date.now().toString(36),name:n,av:form.av,kids:form.kids,rating:form.rating,cap:form.kids?null:(form.cap||null)});
  save();manage=false;var fb=formBack;formBack='pick';go(fb==='cfg'?'cfg':'pick');
}
document.addEventListener('input',function(e){if(e.target.id==='nm'&&form)form.name=e.target.value});
document.addEventListener('change',function(e){if(e.target.id==='rt'&&form)form.rating=e.target.value;if(e.target.id==='cp'&&form)form.cap=e.target.value});
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-a]');if(!b)return;var a=b.dataset.a,id=b.dataset.id;
  if(a==='enter'){cur=find(id);D.last=id;save();tab='home';go('shell')}
  else if(a==='edit'){var p=find(id);form={id:p.id,name:p.name,av:p.av,kids:p.kids,rating:p.rating,cap:p.cap||''};formBack='pick';go('form')}
  else if(a==='new'){form={id:null,name:'',av:D.profiles.length%AV.length,kids:false,rating:'12',cap:''};formBack='pick';go('form')}
  else if(a==='manage'){manage=!manage;render()}
  else if(a==='av'){form.av=+b.dataset.i;render();}
  else if(a==='kids'){form.kids=!form.kids;render()}
  else if(a==='save')saveForm();
  else if(a==='cancel'){var fb2=formBack;formBack='pick';go(fb2==='cfg'?'cfg':'pick')}
  else if(a==='del'){if(confirm('Excluir o perfil “'+form.name+'”? Histórico e lista dele também serão apagados.')){D.profiles=D.profiles.filter(function(p){return p.id!==form.id});if(D.last===form.id)D.last=null;save();manage=D.profiles.length>0;go('pick')}}
  else if(a==='tab'){tab=b.dataset.t;render()}
  else if(a==='ask'){D.ask=!D.ask;save();render()}
  else if(a==='auto'){D.auto=(D.auto===false);save();render()}
  else if(a==='switch'){manage=false;go('pick')}
});

/* ===== Etapa 3: catálogo e página inicial ===== */
function cat(){return D.catalog||(D.catalog=[])}
var RK={'L':0,'10':10,'12':12,'14':14,'16':16,'18':18};
var TYPES=[['filme','Filmes'],['serie','Séries'],['novela','Novelas'],['desenho','Desenhos'],['programa','Programas de TV'],['documentario','Documentários'],['especial','Conteúdos especiais']];
var cform=null,cmsg='';
function okFor(p,it){var lim=p.kids?p.rating:p.cap;return !lim||RK[it.rating]<=RK[lim]}
function rl(r){return r==='L'?'Livre':r+'+'}
function tl(t){var x=TYPES.filter(function(a){return a[0]===t})[0];return x?x[1]:t}
function img(u){return u?'<img src="'+esc(u)+'" alt="" loading="lazy" decoding="async">':''}
function card(it){return '<button class="ct" data-c="info" data-id="'+it.id+'"><div class="cv"><span>'+esc(it.title)+'</span>'+img(it.cover)+'</div></button>'}
function row(t,items){return items.length?'<section class="rw"><h3>'+t+'</h3><div class="sl">'+items.slice(0,30).map(card).join('')+'</div></section>':''}
function bannerCard(it){return '<div class="b">'+img(it.banner||it.cover)+'<span class="rt">'+rl(it.rating)+'</span><h2>'+esc(it.title)+'</h2>'+(it.desc?'<p>'+esc(it.desc)+'</p>':'')+'<button class="btn" data-c="info" data-id="'+it.id+'">Mais informações</button></div>'}
function homeHtml(p){
  var all=cat().filter(function(i){return okFor(p,i)}),h='';
  if(!all.length)h+='<div class="card"><h3>Olá, '+esc(p.name)+'</h3><p>'+(cat().length?'Nenhum conteúdo do catálogo é permitido para este perfil.':'O catálogo está vazio. '+(canAdmin()?'Cadastre os conteúdos no painel administrativo.':'O administrador ainda não publicou conteúdos.'))+'</p>'+(!cat().length&&canAdmin()?'<div class="acts" style="margin-top:12px"><button class="btn" data-m="open">Abrir painel administrativo</button></div>':'')+'</div>';
  var ft=orderedFeatured(all);
  if(ft.length)h+='<div class="bn">'+ft.map(bannerCard).join('')+'</div>';
  h+=contRow(p)+row('Minha Lista',(p.list||[]).map(getIt).filter(function(i){return i&&okFor(p,i)}))+row('Recomendados',recsFor(p));
  h+=row('Adicionados recentemente',all.slice().sort(function(a,b){return b.addedAt-a.addedAt}).slice(0,15));
  orderedTypes().forEach(function(t){h+=row(t[1],all.filter(function(i){return i.type===t[0]}))});
  return h;
}
function fld(l,k,ph){return '<div><label>'+l+'</label><input type="text" data-f="'+k+'" value="'+esc(cform[k])+'" placeholder="'+(ph||'')+'" autocomplete="off"></div>'}
function renderAdd(){
  var f=cform,h='<div class="form"><h2>'+(f.id?'Editar conteúdo':'Novo conteúdo')+'</h2>';
  h+=fld('Título','title','Nome do conteúdo');
  h+='<div><label>Tipo</label><select data-f="type">'+TYPES.map(function(t){return '<option value="'+t[0]+'"'+(f.type===t[0]?' selected':'')+'>'+t[1]+'</option>'}).join('')+'</select></div>';
  h+='<div><label>Classificação indicativa</label><select data-f="rating">'+['L','10','12','14','16','18'].map(function(r){return '<option value="'+r+'"'+(f.rating===r?' selected':'')+'>'+(r==='L'?'Livre':r+' anos')+'</option>'}).join('')+'</select></div>';
  h+='<div><label>Descrição curta</label><textarea data-f="desc" maxlength="300">'+esc(f.desc)+'</textarea></div>';
  h+=fld('Gênero (ex.: Drama)','genre','')+fld('Ano de lançamento','year','2024')+fld('País de origem','country','Brasil')+fld('Duração (ex.: 1h50)','duration','')+fld('Elenco (opcional)','cast','')+fld('Direção (opcional)','director','')+fld('URL da capa vertical (opcional)','cover','https://...')+fld('URL do banner horizontal (opcional)','banner','https://...')+fld('URL do vídeo MP4, M3U8 ou YouTube/Drive/Odysee (opcional)','video','https://...')+fld('URL da legenda .vtt (opcional)','subs','https://...');
  h+='<label class="row" style="margin:0;color:var(--tx);font-size:15px"><span>Mostrar nos destaques</span><input type="checkbox" data-f="featured"'+(f.featured?' checked':'')+'></label>';
  h+='<p class="err">'+esc(cmsg)+'</p><div class="acts"><button class="btn" data-c="csave">Salvar</button><button class="btn g" data-c="ccancel">Cancelar</button></div></div>';
  $app.innerHTML=h;
}
function okUrl(u){if(!u)return true;try{var x=new URL(u);return x.protocol==='https:'||x.protocol==='http:'}catch(e){return false}}
function saveItem(){
  var f=cform,t=f.title.trim();
  if(t.length<2||t.length>120){cmsg='O título precisa ter de 2 a 120 caracteres.';return render()}
  if(!TYPES.some(function(x){return x[0]===f.type})){cmsg='Escolha um tipo.';return render()}
  if(['L','10','12','14','16','18'].indexOf(f.rating)<0){cmsg='Classificação inválida.';return render()}
  if(!okUrl(f.cover)||!okUrl(f.banner)||!okUrl(f.video)||!okUrl(f.subs)){cmsg='As URLs precisam começar com http:// ou https://.';return render()}
  var ys=String(f.year||'').trim(),yr=parseInt(ys,10);
  if(ys&&!(yr>=1900&&yr<=2100)){cmsg='Ano inválido (use 1900 a 2100).';return render()}
  var data={title:t,type:f.type,rating:f.rating,desc:f.desc.trim().slice(0,300),genre:f.genre.trim(),year:ys?yr:null,country:f.country.trim(),duration:f.duration.trim(),cast:f.cast.trim(),director:f.director.trim(),subs:(f.subs||'').trim(),cover:f.cover.trim(),banner:f.banner.trim(),video:f.video.trim(),featured:!!f.featured};
  if(f.id){var it=getIt(f.id);if(!it){cmsg='Conteúdo não encontrado.';return render()}Object.assign(it,data)}
  else cat().push(Object.assign({id:'c'+Date.now().toString(36),eps:[],addedAt:Date.now()},data));
  save();var bk=admBack;admBack='shell';
  if(bk==='adm')go('adm');else{tab='home';go('shell')}
}
function closeInfo(){var m=document.getElementById('md');if(m)m.remove()}
function openInfo(id){
  var it=cat().filter(function(i){return i.id===id})[0];if(!it)return;closeInfo();
  var d=document.createElement('div');d.className='mdl';d.id='md';
  d.onclick=function(e){if(e.target===d)closeInfo()};
  d.innerHTML='<div class="sheet"><div class="hd">'+img(it.banner||it.cover)+'</div><div class="bd"><span class="rt">'+rl(it.rating)+'</span><h2>'+esc(it.title)+'</h2><p>'+esc(meta(it))+'</p>'+(it.desc?'<p>'+esc(it.desc)+'</p>':'')+'<div class="acts"><button class="btn g" data-c="close">Fechar</button><button class="btn d" data-c="crem" data-id="'+it.id+'">Remover</button></div></div></div>';
  document.body.appendChild(d);
}
/* ===== Etapa 4: explorar, busca e filtros ===== */
var ex={q:'',genre:'',year:'',type:'',rating:''};
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function meta(it){return [tl(it.type),it.genre,it.year,it.duration,it.country].filter(Boolean).join(' · ')}
function uniq(a){var s={},o=[];a.forEach(function(x){if(x&&!s[norm(x)]){s[norm(x)]=1;o.push(x)}});return o}
function sel(k,lbl,opts){return '<select data-x="'+k+'" aria-label="'+lbl+'"><option value="">'+lbl+'</option>'+opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(String(ex[k])===String(o[0])?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select>'}
function exploreHtml(p){
  var all=cat().filter(function(i){return okFor(p,i)});
  var h='<input type="text" data-x="q" id="q" value="'+esc(ex.q)+'" placeholder="Buscar título, gênero ou tipo" autocomplete="off" enterkeyhint="search">';
  h+='<div class="chips" style="margin-top:12px"><button class="chip'+(ex.type?'':' on')+'" data-x="chip" data-v="">Tudo</button>'+TYPES.map(function(t){return '<button class="chip'+(ex.type===t[0]?' on':'')+'" data-x="chip" data-v="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>';
  var gs=uniq(all.map(function(i){return i.genre})).sort().map(function(g){return [g,g]});
  var ys=uniq(all.map(function(i){return i.year})).sort(function(a,b){return b-a}).map(function(y){return [y,y]});
  var rs=['L','10','12','14','16','18'].map(function(r){return [r,'Até '+(r==='L'?'Livre':r+' anos')]});
  h+='<div class="fl">'+sel('genre','Gênero',gs)+sel('year','Ano',ys)+sel('rating','Classificação',rs)+'<button class="btn g" data-x="clear">Limpar filtros</button></div>';
  return h+'<div id="res">'+resHtml(p)+'</div>';
}
function resHtml(p){
  var all=cat().filter(function(i){return okFor(p,i)});
  if(!all.length)return '<div class="card"><p>O catálogo está vazio. Cadastre conteúdos na aba Início para poder buscar.</p></div>';
  var q=norm(ex.q),r=ex.rating?RK[ex.rating]:99;
  var out=all.filter(function(i){
    if(ex.type&&i.type!==ex.type)return false;
    if(ex.genre&&norm(i.genre)!==norm(ex.genre))return false;
    if(ex.year&&String(i.year)!==String(ex.year))return false;
    if(RK[i.rating]>r)return false;
    return !q||norm([i.title,i.genre,tl(i.type),i.desc,i.country,(i.eps||[]).map(function(e){return e.title}).join(' ')].join(' ')).indexOf(q)>-1;
  }).sort(function(a,b){return a.title.localeCompare(b.title,'pt-BR')});
  if(!out.length)return '<div class="card"><p>Nada encontrado com essa busca e esses filtros.</p></div>';
  var lim=ex.lim||60;return '<p class="cnt">'+out.length+(out.length===1?' resultado':' resultados')+'</p><div class="gr">'+out.slice(0,lim).map(card).join('')+'</div>'+(out.length>lim?'<div class="acts" style="margin-top:14px"><button class="btn g" data-x="more">Mostrar mais</button></div>':'');
}
function onEx(e){var k=e.target.dataset&&e.target.dataset.x;if(!k||k==='chip'||k==='clear')return;ex[k]=e.target.value;ex.lim=0;var r=document.getElementById('res');if(r&&cur)r.innerHTML=resHtml(cur)}
document.addEventListener('input',onEx);document.addEventListener('change',onEx);
document.addEventListener('click',function(e){var b=e.target.closest('[data-x]');if(!b)return;var k=b.dataset.x;if(k==='chip'){ex.type=b.dataset.v;ex.lim=0;render()}else if(k==='more'){ex.lim=(ex.lim||60)+60;var r2=document.getElementById('res');if(r2&&cur)r2.innerHTML=resHtml(cur)}else if(k==='clear'){ex={q:'',genre:'',year:'',type:'',rating:''};render()}});
/* ===== Etapa 5: página de detalhes, temporadas e episódios, Minha Lista ===== */
var det=null,dseason=null,EPT={serie:1,novela:1,programa:1};
function getIt(id){return cat().filter(function(i){return i.id===id})[0]}
function listHtml(p){
  var ids=p.list||[],items=ids.map(getIt).filter(function(i){return i&&okFor(p,i)});
  if(!items.length)return '<div class="card"><h3>Minha Lista</h3><p>Você ainda não adicionou nada. Abra um conteúdo e toque em “+ Minha Lista”. A lista é individual deste perfil.</p></div>';
  return '<h3 class="sec" style="margin-top:0">Minha Lista</h3><div class="gr">'+items.map(card).join('')+'</div>';
}
function seasonsOf(it){var s={};(it.eps||[]).forEach(function(e){s[e.s]=1});return Object.keys(s).map(Number).sort(function(a,b){return a-b})}
function renderDetail(){
  var it=getIt(det);if(!it){view='shell';return render()}
  var inL=(cur.list||[]).indexOf(it.id)>-1;
  var h='<div class="dh">'+img(it.banner||it.cover)+'<button class="bk" data-d="back" aria-label="Voltar">←</button></div><div class="main" style="padding-top:0">';
  h+='<div class="dt"><div class="cv"><span>'+esc(it.title)+'</span>'+img(it.cover)+'</div><div><h1>'+esc(it.title)+'</h1><span class="rt">'+rl(it.rating)+'</span></div></div>';
  h+='<p style="color:var(--mut);margin:0 0 14px">'+esc(meta(it))+'</p>';
  h+='<div class="acts">'+watchBtn(it)+'<button class="btn g" data-d="list">'+(inL?'✓ Na Minha Lista':'+ Minha Lista')+'</button></div>';
  h+='<h3 class="sec">Sinopse</h3><p style="margin:0;line-height:1.55;color:#d5daf5">'+(it.desc?esc(it.desc):'Sem sinopse cadastrada.')+'</p>';
  var rows=[['Tipo',tl(it.type)],['Gênero',it.genre],['Ano',it.year],['País',it.country],['Duração',it.duration],['Elenco',it.cast],['Direção',it.director]].filter(function(r){return r[1]});
  h+='<h3 class="sec">Informações adicionais</h3><dl class="dl">'+rows.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd>'}).join('')+'</dl>';
  if(EPT[it.type]){
    var ss=seasonsOf(it);if(ss.length&&ss.indexOf(dseason)<0)dseason=ss[0];
    h+='<h3 class="sec">Episódios</h3>';
    if(ss.length){
      h+='<div class="chips">'+ss.map(function(s){return '<button class="chip'+(s===dseason?' on':'')+'" data-d="season" data-v="'+s+'">Temporada '+s+'</button>'}).join('')+'</div>';
      h+=it.eps.filter(function(e){return e.s===dseason}).sort(function(a,b){return a.n-b.n}).map(function(e){return '<div class="ep"><div class="et">'+img(e.thumb)+'</div><div style="min-width:0;flex:1"><b>E'+e.n+' · '+esc(e.title)+'</b>'+(e.duration?'<p>'+esc(e.duration)+'</p>':'')+(e.desc?'<p>'+esc(e.desc)+'</p>':'')+epPlay(it,e)+'<button class="btn d" style="padding:6px 10px;font-size:12px;margin-left:8px" data-d="eprem" data-id="'+e.id+'">Remover</button></div></div>'}).join('');
    }else h+='<div class="card"><p>Nenhum episódio cadastrado ainda.</p></div>';
    h+='<div class="acts"><button class="btn g" data-d="addep">+ Cadastrar episódio</button></div>';
  }
  h+='<div class="acts" style="margin-top:26px"><button class="btn d" data-d="remove">Remover conteúdo do catálogo</button></div></div>';
  $app.innerHTML=h;
}
function renderEp(){
  var f=cform,h='<div class="form"><h2>'+(f.eid?'Editar episódio':'Novo episódio')+'</h2>';
  h+=fld('Temporada (número)','season','1')+fld('Episódio (número)','num','1')+fld('Título','title','')+'<div><label>Sinopse</label><textarea data-f="desc" maxlength="300">'+esc(f.desc)+'</textarea></div>'+fld('URL da miniatura (opcional)','thumb','https://...')+fld('Duração (ex.: 45min)','duration','')+fld('URL de reprodução MP4, M3U8 ou YouTube/Drive/Odysee (opcional)','video','https://...')+fld('URL da legenda .vtt (opcional)','subs','https://...');
  h+='<p class="err">'+esc(cmsg)+'</p><div class="acts"><button class="btn" data-d="epsave">Salvar</button><button class="btn g" data-d="epcancel">Cancelar</button></div></div>';
  $app.innerHTML=h;
}
function saveEp(it){
  var f=cform,s=parseInt(f.season,10),n=parseInt(f.num,10),t=f.title.trim();
  if(!(s>=1&&n>=1&&s<=99&&n<=9999)){cmsg='Temporada e episódio precisam ser números a partir de 1.';return render()}
  if(t.length<2||t.length>120){cmsg='O título do episódio precisa ter de 2 a 120 caracteres.';return render()}
  if(!okUrl(f.thumb)||!okUrl(f.video)||!okUrl(f.subs)){cmsg='As URLs precisam começar com http:// ou https://.';return render()}
  it.eps=it.eps||[];
  if(it.eps.some(function(e){return e.s===s&&e.n===n&&e.id!==f.eid})){cmsg='Esse episódio já existe nessa temporada.';return render()}
  var data={s:s,n:n,title:t,desc:f.desc.trim().slice(0,300),thumb:f.thumb.trim(),duration:f.duration.trim(),video:f.video.trim(),subs:(f.subs||'').trim()};
  if(f.eid){var e0=it.eps.filter(function(x){return x.id===f.eid})[0];if(e0)Object.assign(e0,data);else it.eps.push(Object.assign({id:f.eid},data))}
  else it.eps.push(Object.assign({id:'e'+Date.now().toString(36)},data));
  dseason=s;save();var eb=epBack;epBack='detail';go(eb);
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-d]');if(!b)return;var a=b.dataset.d,it=getIt(det);
  if(a==='back')go('shell');
  else if(a==='list'&&it){cur.list=cur.list||[];var ix=cur.list.indexOf(it.id);if(ix>-1)cur.list.splice(ix,1);else cur.list.push(it.id);save();renderDetail()}
  else if(a==='play'&&it){var pe0=EPT[it.type]?pickEp(it):null;if(!EPT[it.type]||pe0)openPlayer(it,pe0)}
  else if(a==='playep'&&it){var pe=(it.eps||[]).filter(function(x){return x.id===b.dataset.id})[0];if(pe)openPlayer(it,pe)}
  else if(a==='season'){dseason=+b.dataset.v;renderDetail()}
  else if(a==='addep'){cform={eid:null,season:String(dseason||1),num:'',title:'',desc:'',thumb:'',duration:'',video:'',subs:''};cmsg='';epBack='detail';go('ep')}
  else if(a==='epcancel'){var eb2=epBack;epBack='detail';go(eb2)}
  else if(a==='epsave'&&it)saveEp(it);
  else if(a==='eprem'&&it){if(confirm('Remover este episódio?')){var eid=b.dataset.id;it.eps=(it.eps||[]).filter(function(x){return x.id!==eid});save();renderDetail()}}
  else if(a==='remove'&&it){if(confirm('Remover “'+it.title+'” do catálogo, com seus episódios?')){purgeItem(it.id);save();go('shell')}}
});
/* ===== Etapa 6: player de vídeo (MP4 e HLS), retomada, próximo episódio ===== */
var P=null,HLSV='https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.13/hls.min.js';
function loadHls(cb){if(window.Hls)return cb();var s=document.createElement('script');s.src=HLSV;s.onload=cb;s.onerror=function(){cb()};document.head.appendChild(s)}
function fmt(s){s=Math.max(0,Math.floor(s||0));var h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+':'+(m<10?'0':''):'')+m+':'+(x<10?'0':'')+x}
function pkey(it,ep){return ep?it.id+':'+ep.id:it.id}
function progOf(it,ep){return (cur.prog||{})[pkey(it,ep)]}
function qEps(it){return (it.eps||[]).filter(function(e){return e.video}).sort(function(a,b){return a.s-b.s||a.n-b.n})}
function nextEp(it,ep){var q=qEps(it),i=q.map(function(e){return e.id}).indexOf(ep.id);return q[i+1]||null}
function pickEp(it){var q=qEps(it),best=null;q.forEach(function(e){var g=progOf(it,e);if(g&&!g.done&&(!best||g.at>progOf(it,best).at))best=e});if(best)return best;var nd=q.filter(function(e){var g=progOf(it,e);return !(g&&g.done)})[0];return nd||q[0]}
function watchBtn(it){
  var epi=EPT[it.type],ep=epi?pickEp(it):null,src=epi?(ep&&ep.video):it.video;
  if(!src)return '<span class="cnt" style="align-self:center;margin:0">Sem vídeo cadastrado</span>';
  var g=progOf(it,ep),tag=ep?' T'+ep.s+' E'+ep.n:'';
  return '<button class="btn" data-d="play">'+(g&&!g.done&&g.t>10?'▶ Continuar'+tag+' ('+fmt(g.t)+')':'▶ Assistir'+tag)+'</button>';
}
function epPlay(it,e){if(!e.video)return '';var g=progOf(it,e);return '<button class="btn" style="padding:6px 12px;font-size:12px" data-d="playep" data-id="'+e.id+'">▶ '+(g&&g.done?'Rever':g&&g.t>10?'Continuar '+fmt(g.t):'Assistir')+'</button>'}
function $p(id){return document.getElementById(id)}
function spin(){var s=$p('ps');if(s)s.style.display='block'}
function unspin(){var s=$p('ps');if(s)s.style.display='none'}
function note(msg,btns){var z=$p('pz');if(!z)return;if(P)clearTimeout(P.nt);if(!msg){z.innerHTML='';return}z.innerHTML='<div class="bx"><span id="cdn">'+esc(msg)+'</span>'+(btns||[]).map(function(b){return '<button data-p="'+b[1]+'">'+b[0]+'</button>'}).join('')+'</div>'}
function saveProg(force){
  if(!P||!P.ready||!cur)return;var v=P.v,d=v.duration;if(!d||!isFinite(d))return;
  var now=Date.now();if(!force&&now-P.last<5000)return;P.last=now;
  cur.prog=cur.prog||{};cur.prog[pkey(P.it,P.ep)]={t:P.done?0:v.currentTime,d:d,at:now,done:!!P.done||d-v.currentTime<15};save();
}
function openPlayer(it,ep){
  closePlayer(true);
  var d=document.createElement('div');d.className='pl';d.id='pl';
  d.innerHTML='<div class="pw" id="pw"><video id="pv" playsinline preload="metadata"></video><div class="ps" id="ps"></div><div class="pc" id="pc"><div class="pt"><button data-p="back" aria-label="Voltar">←</button><span id="ptl"></span></div><div class="pm"><button data-p="rw" aria-label="Voltar 10 segundos">−10</button><button id="ppb" data-p="pp" aria-label="Reproduzir ou pausar">▶</button><button data-p="ff" aria-label="Avançar 10 segundos">+10</button></div><div class="pb"><input type="range" id="sk" min="0" max="1000" value="0" aria-label="Progresso"><div class="pr"><span id="tm">0:00</span><span class="sp"></span><button data-p="next" id="nx" style="display:none" aria-label="Próximo episódio">⏭</button><select id="ql" aria-label="Qualidade" style="display:none"></select><button data-p="cc" id="cc" style="display:none">CC</button><button data-p="mute" id="mu" aria-label="Mudo">🔊</button><input type="range" id="vl" min="0" max="1" step="0.05" value="1" aria-label="Volume"><button data-p="fs" aria-label="Tela cheia">⛶</button></div></div></div><div class="pz" id="pz"></div></div><div class="pi" id="pi"></div>';
  document.body.appendChild(d);
  P={it:it,ep:null,v:d.querySelector('video'),el:d,hls:null,last:0,done:false,ready:false,tok:0};
  wirePlayer();startEp(it,ep);
}
function wirePlayer(){
  var v=P.v,sk=$p('sk');
  function on(ev,fn){v.addEventListener(ev,function(e){if(P&&P.v===v)fn(e)})}
  P.bump=function(){var pc=$p('pc');if(!pc)return;pc.classList.remove('h');clearTimeout(P.ht);if(!v.paused)P.ht=setTimeout(function(){pc.classList.add('h')},3000)};
  $p('pw').addEventListener('click',function(e){if(!P)return;if(e.target.closest('button,input,select'))return P.bump();var pc=$p('pc');if(pc.classList.contains('h'))P.bump();else{clearTimeout(P.ht);pc.classList.add('h')}});
  on('play',function(){$p('ppb').textContent='⏸';P.bump()});
  on('pause',function(){$p('ppb').textContent='▶';P.bump();saveProg(true)});
  on('waiting',spin);on('seeking',spin);on('stalled',spin);on('playing',unspin);on('canplay',unspin);on('seeked',unspin);
  on('loadedmetadata',function(){P.ready=true});
  on('timeupdate',function(){var d=v.duration;if(d&&isFinite(d)){if(document.activeElement!==sk)sk.value=Math.round(v.currentTime/d*1000);$p('tm').textContent=fmt(v.currentTime)+' / '+fmt(d)}saveProg(false)});
  on('volumechange',function(){$p('mu').textContent=(v.muted||v.volume===0)?'🔇':'🔊'});
  on('error',function(){unspin();if(v.getAttribute('src')){var u=P.ep?P.ep.video:P.it.video;note(/\.(mp4|m4v|webm|mov|ogv)(\?|#|$)/i.test(u)?'Não foi possível carregar o vídeo. Confira a URL e se o servidor permite acesso (CORS).':'Esse link não é de um arquivo de vídeo nem de um formato reconhecido. Use .mp4, .m3u8 ou o link do YouTube, Drive ou Odysee.',[])}});
  on('ended',onEnd);
  sk.addEventListener('input',function(){if(P&&v.duration)v.currentTime=sk.value/1000*v.duration;if(P)P.bump()});
  $p('vl').addEventListener('input',function(e){v.volume=+e.target.value;v.muted=false});
  $p('ql').addEventListener('change',function(e){if(P&&P.hls)P.hls.currentLevel=+e.target.value});
}
function startEp(it,ep){
  var v=P.v;saveProg(true);
  if(P.hls){P.hls.destroy();P.hls=null}
  clearInterval(P.cd);clearTimeout(P.nt);
  P.it=it;P.ep=ep;P.done=false;P.last=0;P.ready=false;var tok=++P.tok;P.season=ep?ep.s:null;setTimeout(function(){if(P)renderInfo()},0);
  var src=ep?ep.video:it.video,subs=ep?ep.subs:it.subs;
  var emb=embedOf(src),oldF=$p('pw').querySelector('iframe');if(oldF)oldF.remove();
  P.el.classList.toggle('emb',!!emb);P.emb=emb||null;
  if(emb){
    v.pause();v.removeAttribute('src');v.style.display='none';
    $p('ptl').textContent=it.title+(ep?' · T'+ep.s+' E'+ep.n+' '+ep.title:'');
    var fr=document.createElement('iframe');fr.src=D.autoplay===false?emb.replace('&autoplay=1',''):emb;fr.allow='autoplay; fullscreen; encrypted-media; picture-in-picture';fr.allowFullscreen=true;fr.style.cssText='width:100%;height:100%;border:0;background:#000';
    $p('pw').insertBefore(fr,$p('pw').firstChild);note(null);unspin();$p('nx').style.display='none';return;
  }
  v.style.display='';
  $p('ptl').textContent=it.title+(ep?' · T'+ep.s+' E'+ep.n+' '+ep.title:'');
  var nx=ep?nextEp(it,ep):null;$p('nx').style.display=nx?'':'none';
  note(null);
  var ql=$p('ql');ql.style.display='none';ql.innerHTML='';
  Array.prototype.forEach.call(v.querySelectorAll('track'),function(t){t.remove()});
  v.removeAttribute('crossorigin');$p('cc').style.display='none';
  if(subs){v.setAttribute('crossorigin','anonymous');var t=document.createElement('track');t.kind='subtitles';t.srclang='pt';t.label='Português';t.src=subs;v.appendChild(t);try{t.track.mode='showing'}catch(e){}$p('cc').style.display='';$p('cc').style.opacity=1}
  var g=progOf(it,ep),start=0;
  if(g&&!g.done&&g.t>10&&(!g.d||g.t<g.d-20))start=g.t;
  if(start){var onMeta=function(){v.currentTime=start;v.removeEventListener('loadedmetadata',onMeta)};v.addEventListener('loadedmetadata',onMeta);note('Continuando de '+fmt(start),[['Começar do início','restart']]);P.nt=setTimeout(function(){note(null)},6000)}
  spin();
  v.preload=D.saver?'none':'metadata';
  var play=function(){if(D.autoplay===false){unspin();return}var r=v.play();if(r&&r.catch)r.catch(function(){unspin()})};
  if(/\.m3u8(\?|#|$)/i.test(src)){
    loadHls(function(){
      if(!P||P.tok!==tok)return;
      if(window.Hls&&Hls.isSupported()){
        var h=new Hls(D.saver?{capLevelToPlayerSize:true,maxBufferLength:8,maxMaxBufferLength:12,startLevel:0}:{capLevelToPlayerSize:true,maxBufferLength:20});P.hls=h;
        h.on(Hls.Events.MANIFEST_PARSED,function(){if(h.levels.length>1){ql.innerHTML='<option value="-1">Auto</option>'+h.levels.map(function(l,i){return '<option value="'+i+'">'+(l.height?l.height+'p':Math.round(l.bitrate/1000)+'k')+'</option>'}).join('');ql.style.display='';var pq=(D.saver||D.quality==='low')?0:(D.quality==='high'?h.levels.length-1:-1);if(pq>=0){h.currentLevel=pq;ql.value=String(pq)}}play()});
        h.on(Hls.Events.ERROR,function(_,e){if(e.fatal){unspin();note('Falha ao carregar o vídeo HLS. Confira a URL e o acesso (CORS).',[])}});
        h.loadSource(src);h.attachMedia(v);
      }else if(v.canPlayType('application/vnd.apple.mpegurl')){v.src=src;play()}
      else{unspin();note('Este aparelho não consegue reproduzir HLS.',[])}
    });
  }else{v.src=src;play()}
}
function embedOf(u){
  try{
    var x=new URL(u),h=x.hostname.replace(/^www\.|^m\./,''),id=null;
    if(h==='youtu.be')id=x.pathname.slice(1).split('/')[0];
    else if(h==='youtube.com'||h==='youtube-nocookie.com'){id=x.searchParams.get('v');if(!id){var m=x.pathname.match(/^\/(embed|shorts|live)\/([\w-]{11})/);if(m)id=m[2]}}
    if(id&&/^[\w-]{11}$/.test(id))return 'https://www.youtube-nocookie.com/embed/'+id+'?rel=0&playsinline=1&autoplay=1';
    if(h==='drive.google.com'){var d=x.pathname.match(/^\/file\/d\/([\w-]+)/);if(d)return 'https://drive.google.com/file/d/'+d[1]+'/preview'}
    if(h==='odysee.com'&&x.pathname.indexOf('/$/embed/')===0)return 'https://odysee.com'+x.pathname;
    if(h==='odysee.com'&&x.pathname.length>1&&x.pathname.indexOf('/$/')!==0)return 'https://odysee.com/$/embed'+x.pathname;
  }catch(e){}
  return null;
}
function renderInfo(){
  var el=$p('pi');if(!el||!P)return;
  var it=P.it,ep=P.ep,inL=(cur.list||[]).indexOf(it.id)>-1,src=ep?ep.video:it.video,h='';
  h+='<h2 style="margin:0 0 6px;font-size:20px">'+esc(it.title)+'</h2>';
  if(ep)h+='<p style="margin:0 0 8px;font-weight:600">T'+ep.s+' E'+ep.n+' · '+esc(ep.title)+'</p>';
  h+='<p class="cnt" style="margin:0 0 12px"><span class="rt" style="display:inline-block">'+rl(it.rating)+'</span> '+esc([it.year,(ep&&ep.duration)||it.duration,it.genre].filter(Boolean).join(' · '))+'</p>';
  h+='<div class="acts"><button class="btn g" data-p="plist">'+(inL?'✓ Na Minha Lista':'+ Minha Lista')+'</button>'+(P.emb?'<a class="btn g" style="text-decoration:none;text-align:center" href="'+esc(src)+'" target="_blank" rel="noopener">Abrir no site de origem</a>':'')+'</div>';
  var syn=(ep&&ep.desc)||it.desc;
  if(syn)h+='<p style="margin:14px 0 0;line-height:1.55;color:#d5daf5">'+esc(syn)+'</p>';
  if(ep){var nx=nextEp(it,ep);if(nx)h+='<button class="row" data-p="next"><span>Próximo episódio<small>T'+nx.s+' E'+nx.n+' · '+esc(nx.title)+'</small></span><span>⏭</span></button>'}
  if(EPT[it.type]){
    var ss=seasonsOf(it);if(ss.length){
      if(ss.indexOf(P.season)<0)P.season=ss[0];
      h+='<h3 class="sec">Episódios</h3><div class="chips">'+ss.map(function(s){return '<button class="chip'+(s===P.season?' on':'')+'" data-p="pseason" data-v="'+s+'">Temporada '+s+'</button>'}).join('')+'</div>';
      h+=it.eps.filter(function(e){return e.s===P.season}).sort(function(a,b){return a.n-b.n}).map(function(e){return '<button class="ep'+(ep&&e.id===ep.id?' on':'')+'" data-p="goep" data-id="'+e.id+'"><div class="et">'+img(e.thumb)+'</div><div style="min-width:0;flex:1"><b>E'+e.n+' · '+esc(e.title)+'</b><p>'+(ep&&e.id===ep.id?'▶ Assistindo':e.video?(e.duration||'Assistir'):'Sem vídeo cadastrado')+'</p></div></button>'}).join('');
    }
  }
  var rows=[['Tipo',tl(it.type)],['Gênero',it.genre],['Ano',it.year],['País',it.country],['Elenco',it.cast],['Direção',it.director]].filter(function(r){return r[1]});
  h+='<h3 class="sec">Informações adicionais</h3><dl class="dl">'+rows.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd>'}).join('')+'</dl>';
  el.innerHTML=h;
}
function onEnd(){
  P.done=true;saveProg(true);var nx=P.ep?nextEp(P.it,P.ep):null;
  if(nx&&D.auto!==false){
    var n=5,lbl=function(){return 'Próximo: T'+nx.s+' E'+nx.n+' · '+nx.title+' em '+n+'s'};
    note(lbl(),[['Assistir agora','nextnow'],['Cancelar','cancelnext']]);
    P.cd=setInterval(function(){n--;if(n<=0){clearInterval(P.cd);startEp(P.it,nx)}else{var c=$p('cdn');if(c)c.textContent=lbl()}},1000);
  }else if(nx)note('Fim do episódio.',[['Próximo episódio','nextnow']]);
  else note('Fim da reprodução.',[['Voltar','back']]);
  P.bump();
}
function toggleFs(){
  var el=$p('pw'),v=P.v;
  if(document.fullscreenElement)document.exitFullscreen();
  else if(el.requestFullscreen)el.requestFullscreen().then(function(){try{screen.orientation.lock('landscape').catch(function(){})}catch(e){}}).catch(function(){});
  else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen();
}
function unlockO(){try{screen.orientation.unlock()}catch(e){}}
document.addEventListener('fullscreenchange',function(){if(document.fullscreenElement){try{screen.orientation.lock('landscape').catch(function(){})}catch(e){}}else unlockO()});
function closePlayer(silent){
  if(!P)return;saveProg(true);
  var p=P;clearTimeout(p.ht);clearTimeout(p.nt);clearInterval(p.cd);
  if(p.hls)p.hls.destroy();
  P=null;
  try{p.v.pause();p.v.removeAttribute('src');p.v.load()}catch(e){}
  if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(function(){});
  unlockO();p.el.remove();
  if(!silent){if(view==='detail')renderDetail();else if(view==='shell'||view==='hist')render()}
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-p]');if(!b||!P)return;var a=b.dataset.p,v=P.v;P.bump();
  if(a==='back')closePlayer();
  else if(a==='pp'){if(v.paused){var r=v.play();if(r&&r.catch)r.catch(function(){})}else v.pause()}
  else if(a==='rw')v.currentTime=Math.max(0,v.currentTime-10);
  else if(a==='ff')v.currentTime=Math.min(v.duration||1e9,v.currentTime+10);
  else if(a==='mute')v.muted=!v.muted;
  else if(a==='fs')toggleFs();
  else if(a==='cc'){var tk=v.textTracks[0];if(tk){tk.mode=tk.mode==='showing'?'hidden':'showing';b.style.opacity=tk.mode==='showing'?1:.5}}
  else if(a==='next'||a==='nextnow'){var nx=P.ep&&nextEp(P.it,P.ep);if(nx){clearInterval(P.cd);startEp(P.it,nx)}}
  else if(a==='cancelnext'){clearInterval(P.cd);note('Reprodução automática cancelada.',[['Próximo episódio','nextnow']])}
  else if(a==='plist'){var it0=P.it;cur.list=cur.list||[];var ix0=cur.list.indexOf(it0.id);if(ix0>-1)cur.list.splice(ix0,1);else cur.list.push(it0.id);save();renderInfo()}
  else if(a==='pseason'){P.season=+b.dataset.v;renderInfo()}
  else if(a==='goep'){var ge=(P.it.eps||[]).filter(function(x){return x.id===b.dataset.id})[0];if(ge&&ge.video){clearInterval(P.cd);startEp(P.it,ge);P.el.scrollTop=0}}
  else if(a==='restart'){v.currentTime=0;note(null)}
});
/* ===== Etapa 7: histórico, continue assistindo, recomendados ===== */
function entriesOf(p){
  return Object.keys(p.prog||{}).map(function(k){
    var g=p.prog[k],a=k.split(':'),it=getIt(a[0]);if(!it||!okFor(p,it))return null;
    var ep=a[1]?(it.eps||[]).filter(function(e){return e.id===a[1]})[0]:null;if(a[1]&&!ep)return null;
    return {k:k,it:it,ep:ep,g:g};
  }).filter(Boolean).sort(function(a,b){return b.g.at-a.g.at});
}
function contItems(p){
  var best={};
  entriesOf(p).forEach(function(x){if(x.g.done||x.g.t<=10||!x.g.d)return;if(!best[x.it.id])best[x.it.id]=x});
  return Object.keys(best).map(function(k){return best[k]}).sort(function(a,b){return b.g.at-a.g.at});
}
function contRow(p){
  var c=contItems(p);if(!c.length)return '';
  return '<section class="rw"><h3>Continue assistindo</h3><div class="sl">'+c.map(function(x){
    var im=x.ep&&x.ep.thumb?x.ep.thumb:(x.it.banner||x.it.cover);
    return '<button class="ct cw" data-h="resume" data-id="'+x.it.id+'" data-ep="'+(x.ep?x.ep.id:'')+'"><div class="cv"><span>'+esc(x.it.title)+'</span>'+img(im)+'<i class="pg"><b style="width:'+Math.min(100,Math.round(x.g.t/x.g.d*100))+'%"></b></i></div><div class="cnt" style="margin:6px 0 0">'+(x.ep?'T'+x.ep.s+' E'+x.ep.n+' · ':'')+'parou em '+fmt(x.g.t)+'</div></button>';
  }).join('')+'</div></section>';
}
function recsFor(p){
  var seen={},gs={},ts={};
  Object.keys(p.prog||{}).forEach(function(k){seen[k.split(':')[0]]=1});
  (p.list||[]).forEach(function(id){seen[id]=1});
  var n=0;
  Object.keys(seen).forEach(function(id){var it=getIt(id);if(!it)return;n++;if(it.genre)gs[norm(it.genre)]=(gs[norm(it.genre)]||0)+1;ts[it.type]=(ts[it.type]||0)+1});
  if(!n)return [];
  return cat().filter(function(i){return okFor(p,i)&&!seen[i.id]}).map(function(i){return {i:i,s:(gs[norm(i.genre)]||0)*2+(ts[i.type]||0)}}).filter(function(x){return x.s>0}).sort(function(a,b){return b.s-a.s}).slice(0,15).map(function(x){return x.i});
}
function renderHist(){
  var p=cur,rows=entriesOf(p);
  var h='<div class="top"><button class="btn g" data-h="hback" style="padding:8px 14px" aria-label="Voltar">←</button><b>Histórico</b><span style="width:48px"></span></div><div class="main">';
  if(!rows.length)h+='<div class="card"><p>Você ainda não assistiu nada neste perfil.</p></div>';
  rows.forEach(function(x){
    var g=x.g,im=x.ep&&x.ep.thumb?x.ep.thumb:(x.it.banner||x.it.cover);
    h+='<div class="ep"><div class="et">'+img(im)+'</div><div style="min-width:0;flex:1"><b>'+esc(x.it.title)+'</b><p>'+(x.ep?'T'+x.ep.s+' E'+x.ep.n+' · '+esc(x.ep.title)+' · ':'')+(g.done?'Assistido':'Parou em '+fmt(g.t))+' · '+new Date(g.at).toLocaleDateString('pt-BR')+'</p>';
    h+='<button class="btn" style="padding:6px 12px;font-size:12px" data-h="resume" data-id="'+x.it.id+'" data-ep="'+(x.ep?x.ep.id:'')+'">▶ '+(g.done?'Rever':'Continuar')+'</button><button class="btn d" style="padding:6px 10px;font-size:12px;margin-left:8px" data-h="hrem" data-k="'+x.k+'">Remover</button></div></div>';
  });
  if(rows.length)h+='<div class="acts" style="margin-top:18px"><button class="btn d" data-h="hclr">Limpar histórico</button></div>';
  $app.innerHTML=h+'</div>';
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-h]');if(!b)return;var a=b.dataset.h;
  if(a==='hist')go('hist');
  else if(a==='hback')go('shell');
  else if(a==='resume'){var it=getIt(b.dataset.id);if(!it)return;var ep=b.dataset.ep?(it.eps||[]).filter(function(x){return x.id===b.dataset.ep})[0]:null;det=it.id;openPlayer(it,ep||null)}
  else if(a==='hrem'){delete cur.prog[b.dataset.k];save();render()}
  else if(a==='hclr'){if(confirm('Limpar todo o histórico deste perfil? O ponto onde você parou em cada vídeo também será apagado.')){cur.prog={};save();render()}}
});
function onField(e){var k=e.target.dataset&&e.target.dataset.f;if(k&&cform)cform[k]=e.target.type==='checkbox'?e.target.checked:e.target.value}
document.addEventListener('input',onField);document.addEventListener('change',onField);
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-c]');if(!b)return;var a=b.dataset.c;
  if(a==='addc'){cform={title:'',type:'filme',rating:'L',desc:'',genre:'',year:'',country:'',duration:'',cast:'',director:'',subs:'',cover:'',banner:'',video:'',featured:false};cmsg='';go('add')}
  else if(a==='ccancel'){var bk0=admBack;admBack='shell';go(bk0==='adm'?'adm':'shell')}
  else if(a==='csave')saveItem()
  else if(a==='info'){det=b.dataset.id;dseason=null;go('detail')}
  else if(a==='close')closeInfo()
  else if(a==='crem'){if(confirm('Remover este conteúdo do catálogo?')){var rid=b.dataset.id;D.catalog=cat().filter(function(i){return i.id!==rid});save();closeInfo();render()}}
});
/* ===== Etapa 8: Supabase (contas, perfis, catálogo, favoritos, progresso) ===== */
var CFG=window.NVK_CONFIG||{};CFG.url=String(CFG.url||'').replace(/\/+$/,'');
var CLOUD=!!(CFG.url&&CFG.anon),SES=null,ADMIN=false,SNAP=null,SYNCING=false,SYNCQ=false,ST=null,SYNCST='',af={mode:'in',email:'',pw:'',msg:'',busy:false};
function sesLoad(){try{var r=localStorage.getItem(KEY+':ses');if(r)SES=JSON.parse(r)}catch(e){}}
function sesSave(){try{localStorage.setItem(KEY+':ses',JSON.stringify(SES))}catch(e){}}
function signOutLocal(){SES=null;ADMIN=false;try{localStorage.removeItem(KEY+':ses')}catch(e){}}
function setRO(){document.body.classList.toggle('ro',CLOUD&&!ADMIN)}
async function refresh(){
  if(!SES||!SES.refresh){signOutLocal();throw new Error('sessao')}
  var r=await fetch(CFG.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:CFG.anon,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:SES.refresh})});
  if(!r.ok){signOutLocal();throw new Error('sessao expirada')}
  var j=await r.json();SES={access:j.access_token,refresh:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000,uid:SES.uid,email:SES.email};sesSave();
}
async function api(path,opt){
  opt=opt||{};
  if(SES&&Date.now()>SES.exp-60000)await refresh();
  var h={apikey:CFG.anon,Authorization:'Bearer '+(SES?SES.access:CFG.anon),'Content-Type':'application/json'};
  if(opt.prefer)h.Prefer=opt.prefer;
  var r=await fetch(CFG.url+'/rest/v1/'+path,{method:opt.method||'GET',headers:h,body:opt.body?JSON.stringify(opt.body):undefined});
  if(r.status===401&&!opt.retry){await refresh();return api(path,Object.assign({},opt,{retry:1}))}
  if(!r.ok)throw new Error(r.status+' '+(await r.text()));
  var t=await r.text();return t?JSON.parse(t):null;
}
function jk(o){return JSON.stringify(o)}
function settingsOf(){return {ask:D.ask!==false,auto_next:D.auto!==false,last_profile:D.last||null,autoplay:D.autoplay!==false,saver:!!D.saver,quality:D.quality||'auto'}}
function wantState(){
  var s={profiles:{},favs:{},prog:{},items:{},eps:{},settings:settingsOf(),cfg:{featured_order:{key:'featured_order',value:cfgOf().featuredOrder||[]},row_order:{key:'row_order',value:cfgOf().rowOrder||[]}}};
  D.profiles.forEach(function(p){
    s.profiles[p.id]={id:p.id,name:p.name,avatar:p.av,kids:!!p.kids,rating:p.rating||'12',rating_cap:p.cap||null};
    (p.list||[]).forEach(function(c){if(getIt(c))s.favs[p.id+'|'+c]={profile_id:p.id,content_id:c}});
    Object.keys(p.prog||{}).forEach(function(k){var g=p.prog[k];s.prog[p.id+'|'+k]={profile_id:p.id,prog_key:k,pos:g.t,dur:g.d,at_ms:g.at,done:!!g.done}});
  });
  cat().forEach(function(it){
    s.items[it.id]={id:it.id,title:it.title,description:it.desc||'',type:it.type,genre:it.genre||'',year:it.year||null,country:it.country||'',duration:it.duration||'',cast_list:it.cast||'',director:it.director||'',rating:it.rating||'L',cover:it.cover||'',banner:it.banner||'',video:it.video||'',subs:it.subs||'',featured:!!it.featured,added_at_ms:it.addedAt||0};
    (it.eps||[]).forEach(function(e){s.eps[e.id]={id:e.id,content_id:it.id,season:e.s,num:e.n,title:e.title,description:e.desc||'',thumb:e.thumb||'',duration:e.duration||'',video:e.video||'',subs:e.subs||''}});
  });
  return s;
}
async function pushTable(table,want,have,keys){
  var up=Object.keys(want).filter(function(k){return jk(want[k])!==jk(have[k])});
  if(up.length)await api(table+'?on_conflict='+keys.join(','),{method:'POST',prefer:'resolution=merge-duplicates,return=minimal',body:up.map(function(k){return want[k]})});
  up.forEach(function(k){have[k]=want[k]});
  var del=Object.keys(have).filter(function(k){return !(k in want)});
  for(var i=0;i<del.length;i++){
    var row=have[del[i]],f=keys.map(function(c){return c+'=eq.'+encodeURIComponent(row[c])}).join('&');
    await api(table+'?'+f,{method:'DELETE'});delete have[del[i]];
  }
}
function scheduleSync(){if(!CLOUD||!SES||!SNAP)return;clearTimeout(ST);ST=setTimeout(syncNow,1200)}
async function syncNow(){
  if(!CLOUD||!SES||!SNAP)return;
  if(SYNCING){SYNCQ=true;return}
  SYNCING=true;
  try{
    var w=wantState();
    await pushTable('profiles',w.profiles,SNAP.profiles,['id']);
    if(ADMIN){await pushTable('contents',w.items,SNAP.items,['id']);await pushTable('episodes',w.eps,SNAP.eps,['id']);await pushTable('app_config',w.cfg,SNAP.cfg,['key'])}
    await pushTable('favorites',w.favs,SNAP.favs,['profile_id','content_id']);
    await pushTable('progress',w.prog,SNAP.prog,['profile_id','prog_key']);
    if(jk(w.settings)!==jk(SNAP.settings)){await api('user_settings?on_conflict=user_id',{method:'POST',prefer:'resolution=merge-duplicates,return=minimal',body:w.settings});SNAP.settings=w.settings}
    SYNCST='ok';
  }catch(e){console.warn('sync',e);SYNCST='erro: '+String(e.message||e).slice(0,140);clearTimeout(ST);if(navigator.onLine!==false)ST=setTimeout(syncNow,20000)}
  SYNCING=false;if(SYNCQ){SYNCQ=false;scheduleSync()}
}
async function cloudLoad(){
  var r=await Promise.all([api('profiles?select=*&order=created_at'),api('favorites?select=*'),api('progress?select=*'),api('user_settings?select=*'),api('contents?select=*'),api('episodes?select=*'),api('admins?select=user_id'),api('app_config?select=*')]);
  ADMIN=r[6].length>0;setRO();
  var localP=D.profiles,localC=D.catalog||[],localS=settingsOf();
  var byId={};
  var profs=r[0].map(function(p){var o={id:p.id,name:p.name,av:p.avatar,kids:p.kids,rating:p.rating,cap:p.rating_cap||null,list:[],prog:{}};byId[p.id]=o;return o});
  r[1].forEach(function(f){if(byId[f.profile_id])byId[f.profile_id].list.push(f.content_id)});
  r[2].forEach(function(g){if(byId[g.profile_id])byId[g.profile_id].prog[g.prog_key]={t:g.pos,d:g.dur,at:Number(g.at_ms),done:g.done}});
  var items=r[4].map(function(c){return {id:c.id,title:c.title,desc:c.description||'',type:c.type,genre:c.genre||'',year:c.year,country:c.country||'',duration:c.duration||'',cast:c.cast_list||'',director:c.director||'',rating:c.rating,cover:c.cover||'',banner:c.banner||'',video:c.video||'',subs:c.subs||'',featured:!!c.featured,addedAt:Number(c.added_at_ms),eps:[]}});
  var im={};items.forEach(function(i){im[i.id]=i});
  r[5].forEach(function(e){if(im[e.content_id])im[e.content_id].eps.push({id:e.id,s:e.season,n:e.num,title:e.title,desc:e.description||'',thumb:e.thumb||'',duration:e.duration||'',video:e.video||'',subs:e.subs||''})});
  var st=r[3][0];
  var cf={};r[7].forEach(function(x){cf[x.key]=x.value});var localCfg=D.cfg;
  D.cfg={featuredOrder:cf.featured_order||[],rowOrder:cf.row_order||[]};
  D.profiles=profs;D.catalog=items;
  if(st){D.autoplay=st.autoplay!==false;D.saver=!!st.saver;D.quality=st.quality||'auto';D.ask=st.ask;D.auto=st.auto_next;D.last=st.last_profile&&byId[st.last_profile]?st.last_profile:null}
  SNAP=wantState();if(!st)SNAP.settings=null;
  Object.keys(SNAP.cfg).forEach(function(k){if(!(k in cf))delete SNAP.cfg[k]});
  if(!profs.length&&localP.length)D.profiles=localP;
  if(ADMIN&&!items.length&&localC.length)D.catalog=localC;
  if(ADMIN&&!r[7].length&&localCfg&&((localCfg.featuredOrder||[]).length||(localCfg.rowOrder||[]).length))D.cfg=localCfg;
  if(!st){D.ask=localS.ask;D.auto=localS.auto_next;D.last=localS.last_profile;D.autoplay=localS.autoplay;D.saver=localS.saver;D.quality=localS.quality}
  save();SYNCST='ok';
}
function authErr(j){
  var m=String((j&&(j.msg||j.error_description||j.message))||'');
  if(/invalid login/i.test(m))return 'E-mail ou senha incorretos.';
  if(/already registered/i.test(m))return 'Este e-mail já tem conta. Use Entrar.';
  if(/email not confirmed/i.test(m))return 'Confirme seu e-mail pelo link que enviamos.';
  if(/rate limit/i.test(m))return 'Muitas tentativas. Aguarde um pouco.';
  return m?'Erro: '+m:'Não foi possível entrar.';
}
async function doAuth(){
  var e=af.email.trim(),p=af.pw;
  if(!/^\S+@\S+\.\S+$/.test(e)){af.msg='E-mail inválido.';return renderAuth()}
  if(p.length<6){af.msg='A senha precisa ter pelo menos 6 caracteres.';return renderAuth()}
  af.busy=true;af.msg='';renderAuth();
  try{
    var up=af.mode==='up';
    var r=await fetch(CFG.url+(up?'/auth/v1/signup':'/auth/v1/token?grant_type=password'),{method:'POST',headers:{apikey:CFG.anon,'Content-Type':'application/json'},body:JSON.stringify({email:e,password:p})});
    var j=await r.json();
    if(!r.ok)af.msg=authErr(j);
    else if(!j.access_token){af.msg='Conta criada. Confirme o e-mail que enviamos e depois toque em Entrar.';af.mode='in'}
    else{
      SES={access:j.access_token,refresh:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000,uid:j.user&&j.user.id,email:e};sesSave();
      D={profiles:[],ask:true,last:null,catalog:[]};
      await cloudLoad();af.pw='';af.busy=false;return go('pick');
    }
  }catch(err){af.msg='Sem conexão com o servidor.'}
  af.busy=false;if(view==='auth')renderAuth();
}
function renderAuth(){
  var up=af.mode==='up';
  var h='<div class="pick"><div class="logo"><b>NVK</b><span>PLAY</span></div><div class="form" style="width:100%;max-width:380px;flex:none;padding-top:28px">';
  h+='<div class="chips" style="margin:0"><button class="chip'+(up?'':' on')+'" data-s="mi">Entrar</button><button class="chip'+(up?' on':'')+'" data-s="mu">Criar conta</button></div>';
  h+='<div><label>E-mail</label><input type="email" data-g="email" value="'+esc(af.email)+'" autocomplete="email" inputmode="email"></div>';
  h+='<div><label>Senha</label><input type="password" data-g="pw" value="'+esc(af.pw)+'" autocomplete="'+(up?'new-password':'current-password')+'"></div>';
  h+='<p class="err">'+esc(af.msg)+'</p><button class="btn" data-s="go"'+(af.busy?' disabled':'')+'>'+(af.busy?'Aguarde…':(up?'Criar conta':'Entrar'))+'</button></div></div>';
  $app.innerHTML=h;
}
async function doSignOut(){
  if(!confirm('Sair da conta neste aparelho?'))return;
  try{await syncNow()}catch(e){}
  signOutLocal();D={profiles:[],ask:true,last:null,catalog:[]};cur=null;SNAP=null;
  try{localStorage.removeItem(KEY)}catch(e){}
  af.pw='';document.body.classList.remove('ro');go('auth');
}
document.addEventListener('input',function(e){var k=e.target.dataset&&e.target.dataset.g;if(k)af[k]=e.target.value});
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-s]');if(!b)return;var a=b.dataset.s;
  if(a==='mi'){af.mode='in';af.msg='';renderAuth()}
  else if(a==='mu'){af.mode='up';af.msg='';renderAuth()}
  else if(a==='go')doAuth();
  else if(a==='out')doSignOut();
});
window.addEventListener('online',scheduleSync);
async function boot(){
  var t0=Date.now();
  if(CLOUD){sesLoad();if(SES){try{await cloudLoad()}catch(e){console.warn(e);SYNCST='sem conexão (usando dados salvos neste aparelho)'}}}
  setTimeout(function(){
    if(CLOUD&&!SES)return go('auth');
    var l=D.last&&find(D.last);if(!D.ask&&l){cur=l;tab='home';go('shell')}else go('pick');
  },Math.max(0,1100-(Date.now()-t0)));
}

/* ===== Etapa 9: painel administrativo ===== */
var admBack='shell',epBack='detail',admId=null,admQ='',formBack='pick',docKey='about';
function canAdmin(){return !CLOUD||ADMIN}
function cfgOf(){return D.cfg||(D.cfg={featuredOrder:[],rowOrder:[]})}
function orderedFeatured(items){
  var ord=cfgOf().featuredOrder||[];
  return items.filter(function(i){return i.featured}).sort(function(a,b){
    var x=ord.indexOf(a.id),y=ord.indexOf(b.id);
    if(x<0&&y<0)return (b.addedAt||0)-(a.addedAt||0);
    if(x<0)return 1;if(y<0)return -1;return x-y;
  });
}
function orderedTypes(){
  var ord=cfgOf().rowOrder||[];
  return TYPES.slice().sort(function(a,b){var x=ord.indexOf(a[0]),y=ord.indexOf(b[0]);if(x<0)x=99;if(y<0)y=99;return x-y});
}
function purgeItem(id){
  D.catalog=cat().filter(function(i){return i.id!==id});
  D.profiles.forEach(function(p){
    p.list=(p.list||[]).filter(function(x){return x!==id});
    Object.keys(p.prog||{}).forEach(function(k){if(k.split(':')[0]===id)delete p.prog[k]});
  });
  var c=cfgOf();c.featuredOrder=(c.featuredOrder||[]).filter(function(x){return x!==id});
}
function mv(arr,id,d){var i=arr.indexOf(id),j=i+d;if(i<0||j<0||j>=arr.length)return arr;var t=arr[i];arr[i]=arr[j];arr[j]=t;return arr}
function admTop(title,act){return '<div class="top"><button class="btn g" data-m="'+act+'" style="padding:8px 14px" aria-label="Voltar">←</button><b>'+esc(title)+'</b><span style="width:48px"></span></div>'}
function blankItem(){return {id:null,title:'',type:'filme',rating:'L',desc:'',genre:'',year:'',country:'',duration:'',cast:'',director:'',subs:'',cover:'',banner:'',video:'',featured:false}}
function itemForm(it){return {id:it.id,title:it.title,type:it.type,rating:it.rating,desc:it.desc||'',genre:it.genre||'',year:it.year?String(it.year):'',country:it.country||'',duration:it.duration||'',cast:it.cast||'',director:it.director||'',subs:it.subs||'',cover:it.cover||'',banner:it.banner||'',video:it.video||'',featured:!!it.featured}}
function admList(){
  var q=norm(admQ),items=cat().slice().sort(function(a,b){return (b.addedAt||0)-(a.addedAt||0)}).filter(function(i){return !q||norm(i.title+' '+tl(i.type)+' '+i.genre).indexOf(q)>-1});
  if(!items.length)return '<div class="card"><p>Nenhum conteúdo encontrado.</p></div>';
  return items.map(function(it){
    return '<div class="ep"><div class="et" style="width:64px;aspect-ratio:2/3">'+img(it.cover||it.banner)+'</div><div style="min-width:0;flex:1"><b>'+esc(it.title)+(it.featured?' ★':'')+'</b><p>'+esc(meta(it))+' · '+rl(it.rating)+'</p><div class="acts s"><button class="btn g" data-m="edit" data-id="'+it.id+'">Editar</button>'+(EPT[it.type]?'<button class="btn g" data-m="eps" data-id="'+it.id+'">Episódios ('+(it.eps||[]).length+')</button>':'')+'<button class="btn d" data-m="del" data-id="'+it.id+'">Excluir</button></div></div></div>';
  }).join('');
}
function ordRow(label,i,idUp,idDn,extra){
  return '<div class="row" style="margin-bottom:8px"><span style="min-width:0">'+label+'</span><span class="acts s" style="flex:none"><button class="btn g" data-m="'+idUp+'" aria-label="Subir">▲</button><button class="btn g" data-m="'+idDn+'" aria-label="Descer">▼</button>'+(extra||'')+'</span></div>';
}
function renderAdm(){
  if(!canAdmin()){$app.innerHTML=admTop('Painel administrativo','back')+'<div class="main"><div class="card"><h3>Acesso restrito</h3><p>Somente administradores podem abrir esta área.</p></div></div>';return}
  var h=admTop('Painel administrativo','back')+'<div class="main">';
  if(!CLOUD)h+='<div class="card"><p>Modo local, sem login: qualquer pessoa com acesso a este aparelho abre este painel. Configure o Supabase para proteger com conta de administrador.</p></div>';
  h+='<div class="acts"><button class="btn" data-m="new">+ Novo conteúdo</button></div>';
  h+='<h3 class="sec">Conteúdos ('+cat().length+')</h3><input type="text" id="aq" value="'+esc(admQ)+'" placeholder="Buscar no catálogo" autocomplete="off"><div id="al" style="margin-top:12px">'+admList()+'</div>';
  var fl=orderedFeatured(cat());
  h+='<h3 class="sec">Destaques da página inicial</h3>';
  if(fl.length)fl.forEach(function(it,i){h+=ordRow((i+1)+'. '+esc(it.title),i,'fup','fdn','<button class="btn d" data-m="funf">Tirar</button>').replace(/data-m="(fup|fdn|funf)"/g,'data-m="$1" data-id="'+it.id+'"')});
  else h+='<div class="card"><p>Nenhum destaque. Marque “Mostrar nos destaques” ao editar um conteúdo.</p></div>';
  h+='<h3 class="sec">Ordem das categorias na Início</h3>';
  orderedTypes().forEach(function(t,i){h+=ordRow(esc(t[1]),i,'tup','tdn').replace(/data-m="(tup|tdn)"/g,'data-m="$1" data-id="'+t[0]+'"')});
  $app.innerHTML=h+'</div>';
}
function renderAdmEps(){
  var it=getIt(admId);if(!it||!canAdmin()){go('adm');return}
  var ss=seasonsOf(it),last=ss.length?ss[ss.length-1]:1;
  var h=admTop(it.title,'eback')+'<div class="main"><div class="acts"><button class="btn" data-m="newep" data-s="'+last+'">+ Episódio</button><button class="btn g" data-m="newep" data-s="'+(ss.length?last+1:1)+'">+ Nova temporada</button></div>';
  if(!ss.length)h+='<div class="card" style="margin-top:14px"><p>Nenhum episódio cadastrado ainda.</p></div>';
  ss.forEach(function(s){
    h+='<h3 class="sec">Temporada '+s+'</h3>';
    h+=it.eps.filter(function(e){return e.s===s}).sort(function(a,b){return a.n-b.n}).map(function(e){return '<div class="ep"><div class="et">'+img(e.thumb)+'</div><div style="min-width:0;flex:1"><b>E'+e.n+' · '+esc(e.title)+'</b><p>'+esc(e.duration||'')+(e.video?'':' · sem vídeo')+'</p><div class="acts s"><button class="btn g" data-m="eedit" data-id="'+e.id+'">Editar</button><button class="btn d" data-m="edel" data-id="'+e.id+'">Excluir</button></div></div></div>'}).join('');
    h+='<div class="acts s" style="margin-bottom:6px"><button class="btn g" data-m="newep" data-s="'+s+'">+ Episódio na temporada '+s+'</button></div>';
  });
  $app.innerHTML=h+'</div>';
}
document.addEventListener('input',function(e){if(e.target.id==='aq'){admQ=e.target.value;var l=document.getElementById('al');if(l)l.innerHTML=admList()}});
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-m]');if(!b)return;var a=b.dataset.m,id=b.dataset.id,it,ids;
  if(a==='back'){tab='me';return go('shell')}
  if(!canAdmin())return;
  if(a==='open')go('adm');
  else if(a==='new'){cform=blankItem();cmsg='';admBack='adm';go('add')}
  else if(a==='edit'){it=getIt(id);if(it){cform=itemForm(it);cmsg='';admBack='adm';go('add')}}
  else if(a==='del'){it=getIt(id);if(it&&confirm('Excluir “'+it.title+'” e todos os episódios? Isso também tira o conteúdo das listas e dos históricos.')){purgeItem(id);save();render()}}
  else if(a==='eps'){admId=id;go('admeps')}
  else if(a==='eback')go('adm');
  else if(a==='newep'){it=getIt(admId);if(!it)return;det=admId;var s0=+b.dataset.s,ns=(it.eps||[]).filter(function(x){return x.s===s0}).map(function(x){return x.n});cform={eid:null,season:String(s0),num:String(ns.length?Math.max.apply(null,ns)+1:1),title:'',desc:'',thumb:'',duration:'',video:'',subs:''};cmsg='';epBack='admeps';go('ep')}
  else if(a==='eedit'){it=getIt(admId);var e0=it&&(it.eps||[]).filter(function(x){return x.id===id})[0];if(!e0)return;det=admId;cform={eid:e0.id,season:String(e0.s),num:String(e0.n),title:e0.title,desc:e0.desc||'',thumb:e0.thumb||'',duration:e0.duration||'',video:e0.video||'',subs:e0.subs||''};cmsg='';epBack='admeps';go('ep')}
  else if(a==='edel'){it=getIt(admId);if(it&&confirm('Excluir este episódio?')){it.eps=(it.eps||[]).filter(function(x){return x.id!==id});purgeEpProg(admId,id);save();render()}}
  else if(a==='fup'||a==='fdn'){ids=orderedFeatured(cat()).map(function(i){return i.id});cfgOf().featuredOrder=mv(ids,id,a==='fup'?-1:1);save();render()}
  else if(a==='funf'){it=getIt(id);if(it){it.featured=false;save();render()}}
  else if(a==='tup'||a==='tdn'){ids=orderedTypes().map(function(t){return t[0]});cfgOf().rowOrder=mv(ids,id,a==='tup'?-1:1);save();render()}
});
function purgeEpProg(cid,eid){D.profiles.forEach(function(p){delete (p.prog||{})[cid+':'+eid]})}

/* ===== Etapa 10: configurações, privacidade e segurança ===== */
function docs(){
  var ct=CFG.contact||'o administrador do serviço';
  return {
    about:['Sobre o aplicativo',['NVK PLAY é um serviço de streaming próprio, com perfis individuais, catálogo, busca e continuar de onde parou.','O catálogo é publicado e mantido pelo administrador, que declara ter os direitos sobre os conteúdos ou autorização dos titulares.','Os vídeos são transmitidos por streaming, sem baixar o arquivo inteiro.']],
    privacy:['Política de privacidade',[
      'Dados que guardamos: o e-mail da conta; os perfis que você cria (nome, avatar e limite de classificação); a Minha Lista, o histórico e o ponto onde você parou em cada vídeo; e suas configurações. A senha é tratada pelo serviço de autenticação e o app nunca a vê.',
      'Para que usamos: apenas para o funcionamento do app, como separar perfis, lembrar onde você parou e sugerir conteúdos parecidos. Não vendemos dados e o app não tem publicidade.',
      'Onde ficam: no banco de dados do Supabase, com regras que deixam cada conta acessar só os próprios dados. Uma cópia fica neste aparelho para o app abrir mais rápido.',
      'Serviços de terceiros: capas, banners e vídeos podem vir de outros sites (como YouTube, Google Drive e Odysee), que podem registrar seu endereço de IP segundo as próprias políticas.',
      'Seus direitos: em Configurações, na seção Conta, você pode excluir sua conta e todos os dados dela. Dúvidas: fale com '+ct+'.']],
    terms:['Termos de uso',[
      'Uso: o NVK PLAY é para uso pessoal e não comercial dos conteúdos disponibilizados.',
      'Conteúdo: o administrador responde pelo que publica e declara que é de sua propriedade ou usado com autorização.',
      'Conta: você é responsável pelo acesso à sua conta e não deve compartilhar sua senha.',
      'Não é permitido copiar, redistribuir ou gravar os conteúdos, nem tentar acessar áreas administrativas ou dados de outras contas.',
      'Disponibilidade: o serviço pode mudar, ficar indisponível ou ser encerrado, sem garantia de funcionamento contínuo. Contato: '+ct+'.']]
  };
}
function tg(k,l,sub,on){return '<button class="row" data-z="'+k+'" style="width:100%;text-align:left;margin-bottom:10px"><span>'+l+'<small>'+sub+'</small></span><span class="sw'+(on?' on':'')+'"></span></button>'}
function renderCfg(){
  var p=cur;if(!p)return go('pick');
  var h='<div class="top"><button class="btn g" data-z="back" style="padding:8px 14px" aria-label="Voltar">←</button><b>Configurações</b><span style="width:48px"></span></div><div class="main">';
  h+='<h3 class="sec" style="margin-top:0">Perfis</h3><div class="card" style="display:flex;gap:14px;align-items:center">'+av(p,false)+'<div><h3 style="margin:0">'+esc(p.name)+'</h3><p>'+(p.kids?'Perfil infantil':'Perfil padrão')+'</p></div></div>';
  h+='<div class="acts"><button class="btn g" data-z="manage">Gerenciar perfis</button><button class="btn g" data-z="editme">Nome e avatar</button></div>';
  var opts=p.kids?[['L','Livre'],['10','Até 10 anos'],['12','Até 12 anos'],['14','Até 14 anos'],['16','Até 16 anos']]:[['','Sem limite'],['L','Livre'],['10','Até 10 anos'],['12','Até 12 anos'],['14','Até 14 anos'],['16','Até 16 anos']];
  var curLim=p.kids?p.rating:(p.cap||'');
  h+='<h3 class="sec">Classificação indicativa</h3><label>Conteúdos permitidos neste perfil</label><select data-z="limit">'+opts.map(function(o){return '<option value="'+o[0]+'"'+(curLim===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>';
  h+='<h3 class="sec">Reprodução</h3>'+tg('tg-autoplay','Iniciar o vídeo automaticamente','Começa a tocar ao abrir',D.autoplay!==false)+tg('tg-auto','Próximo episódio automático','Toca o próximo ao terminar',D.auto!==false)+tg('tg-ask','Perguntar o perfil ao abrir','Mostra “Quem está assistindo?” toda vez',!!D.ask);
  h+='<label style="margin-top:6px">Qualidade de vídeo (vídeos HLS)</label><select data-z="quality">'+[['auto','Automática'],['low','Baixa (gasta menos dados)'],['high','Alta']].map(function(o){return '<option value="'+o[0]+'"'+((D.quality||'auto')===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>';
  h+='<div style="margin-top:10px">'+tg('tg-saver','Economia de dados','Começa em qualidade baixa e carrega menos vídeo adiantado',!!D.saver)+'</div>';
  h+='<h3 class="sec">Conta</h3>';
  if(CLOUD&&SES)h+='<p class="cnt">'+esc(SES.email||'')+' · Nuvem: '+esc(SYNCST||'conectando...')+'</p><div class="acts"><button class="btn g" data-s="out">Sair da conta</button><button class="btn d" data-z="delacc">Excluir minha conta</button></div>';
  else h+='<p class="cnt">Modo local: os dados ficam só neste aparelho.</p><div class="acts"><button class="btn d" data-z="wipe">Apagar dados deste aparelho</button></div>';
  h+='<h3 class="sec">Sobre</h3><div class="acts" style="flex-direction:column"><button class="btn g" data-z="doc" data-v="about">Sobre o aplicativo</button><button class="btn g" data-z="doc" data-v="privacy">Política de privacidade</button><button class="btn g" data-z="doc" data-v="terms">Termos de uso</button></div>';
  $app.innerHTML=h+'</div>';
}
function renderDoc(){
  var d=docs()[docKey]||docs().about;
  $app.innerHTML='<div class="top"><button class="btn g" data-z="dback" style="padding:8px 14px" aria-label="Voltar">←</button><b>'+esc(d[0])+'</b><span style="width:48px"></span></div><div class="main">'+d[1].map(function(t){return '<p style="line-height:1.6;color:#d5daf5;margin:0 0 14px">'+esc(t)+'</p>'}).join('')+'</div>';
}
async function delAccount(){
  if(!confirm('Excluir sua conta e todos os dados dela (perfis, listas e histórico)? Isso não pode ser desfeito.'))return;
  try{await api('rpc/delete_my_account',{method:'POST',body:{}})}catch(e){alert('Não foi possível excluir agora. Tente de novo mais tarde.');return}
  signOutLocal();D={profiles:[],ask:true,last:null,catalog:[]};cur=null;SNAP=null;
  try{localStorage.removeItem(KEY)}catch(e){}
  af.pw='';document.body.classList.remove('ro');go('auth');
}
function wipeLocal(){
  if(!confirm('Apagar todos os perfis, listas e históricos deste aparelho?'))return;
  try{localStorage.removeItem(KEY)}catch(e){}
  D={profiles:[],ask:true,last:null,catalog:[]};cur=null;go('pick');
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-z]');if(!b||b.tagName==='SELECT')return;var a=b.dataset.z;
  if(a==='open')go('cfg');
  else if(a==='back'){tab='me';go('shell')}
  else if(a==='dback')go('cfg');
  else if(a==='manage'){manage=true;go('pick')}
  else if(a==='editme'){var p=cur;form={id:p.id,name:p.name,av:p.av,kids:p.kids,rating:p.rating,cap:p.cap||''};formBack='cfg';go('form')}
  else if(a==='tg-autoplay'){D.autoplay=(D.autoplay===false);save();render()}
  else if(a==='tg-auto'){D.auto=(D.auto===false);save();render()}
  else if(a==='tg-ask'){D.ask=!D.ask;save();render()}
  else if(a==='tg-saver'){D.saver=!D.saver;save();render()}
  else if(a==='doc'){docKey=b.dataset.v;go('doc')}
  else if(a==='delacc')delAccount();
  else if(a==='wipe')wipeLocal();
});
document.addEventListener('change',function(e){
  var t=e.target,z=t.dataset&&t.dataset.z;if(!z||t.tagName!=='SELECT')return;
  if(z==='limit'&&cur){if(cur.kids)cur.rating=t.value||'12';else cur.cap=t.value||null;save();render()}
  else if(z==='quality'){D.quality=t.value;save();render()}
});
document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG')t.remove()},true);

load();render();boot();
if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})});
