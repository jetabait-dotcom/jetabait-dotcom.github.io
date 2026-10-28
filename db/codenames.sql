-- Nickname sessions use a random 122-bit browser capability, hashed at rest.
-- No table or hidden key card is exposed through the Data API.
create schema if not exists jeta_game_private;
revoke all on schema jeta_game_private from public;
grant usage on schema jeta_game_private to anon, authenticated;
create table jeta_game_private.rooms (
 code text primary key,
 host text not null,
 state jsonb not null,
 words text[] not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table jeta_game_private.rooms enable row level security;
revoke all on jeta_game_private.rooms from public, anon, authenticated;
create policy deny_direct_room_access on jeta_game_private.rooms for all to anon,authenticated using(false) with check(false);

create function jeta_game_private.play(p_token uuid, p_action text, p_code text default '', p_data jsonb default '{}')
returns jsonb language plpgsql security definer set search_path = '' as $$
#variable_conflict use_variable
declare
 r jeta_game_private.rooms%rowtype; s jsonb; me jsonb; member jsonb;
 h text; code text; nickname text; team text; role_name text; opponent text; color text;
 words text[]; colors text[]; board jsonb; logs jsonb; clue text; number_text text;
 chosen int; guesses int; cap int; v int; k int; n int; starting text; invalid boolean; changed boolean := false;
 deadline timestamptz; masked jsonb; members jsonb; result jsonb;
begin
 if p_token is null then raise exception 'ไม่มีรหัสผู้เล่น กรุณาเปิดเบราว์เซอร์ที่รองรับ'; end if;
 if pg_catalog.pg_column_size(p_data)>40000 then raise exception 'ข้อมูลใหญ่เกินไป'; end if;
 h := encode(extensions.digest(p_token::text,'sha256'),'hex');
 code := upper(trim(p_code));
 if p_action='create' then
  nickname := trim(p_data->>'name');
  if nickname is null or char_length(nickname) not between 1 and 30 then raise exception 'ใส่ชื่อเล่น 1–30 ตัวอักษร'; end if;
  if (select count(*) from jeta_game_private.rooms x where x.host=h and x.created_at>now()-interval '1 day')>=20 then raise exception 'วันนี้สร้างครบ 20 ห้องแล้ว ลองใช้ห้องเดิม'; end if;
  if p_data->>'language'='custom' then
   select array_agg(w order by w) into words from (select distinct lower(trim(value)) w from jsonb_array_elements_text(p_data->'words') where char_length(trim(value)) between 1 and 24) a;
   if coalesce(cardinality(words),0) not between 25 and 500 then raise exception 'ชุดคำต้องมีคำไม่ซ้ำ 25–500 คำ คำละไม่เกิน 24 ตัวอักษร'; end if;
  elsif p_data->>'language'='en' then
   words := string_to_array('APPLE,RIVER,MOON,BRIDGE,CASTLE,STAR,GLASS,FOREST,TRAIN,QUEEN,GOLD,ROBOT,PIANO,SHADOW,DRAGON,HEART,SPACE,FIRE,SNOW,BOOK,BEACH,DOCTOR,HORSE,SHOE,CROWN,BANK,PLANE,MOUSE,KEY,FIELD,STORM,ROSE,SHIP,SPRING,NIGHT,LIGHT,ICE,CHAIR,CLOCK,DIAMOND,BELL,GHOST,FISH,LION,MOUNTAIN,ROCKET,CLOUD,SCHOOL,CHOCOLATE,GARDEN,PIRATE,MAP,EARTH,TIGER,COFFEE,WATER,DESERT,RAINBOW,CAMERA,BOTTLE,TOWER,SPIDER,SATELLITE,WHALE,ISLAND,WINDOW,FARM,LEMON,KNIGHT,ORANGE,PAPER,PENGUIN,PEARL,CIRCLE,SCREEN,ROOT,GIANT,COPPER,ARM,PLATE,BUTTERFLY,CAVE,EGG,GUITAR,MARKET,MIRROR,OLIVE,POISON,PUMPKIN,ROAD,SEAL,SOCK,TEMPLE,TURTLE,UNICORN,VOLCANO,WATCH,WIND,YARD,ZEBRA',',');
  else
   words := string_to_array('แมว,สุนัข,ทะเล,ภูเขา,แม่น้ำ,ดวงจันทร์,ดาว,ดวงอาทิตย์,ป่า,ต้นไม้,ดอกไม้,กุหลาบ,รถไฟ,เครื่องบิน,เรือ,สะพาน,ปราสาท,มงกุฎ,ราชินี,ราชา,ทอง,เพชร,เงิน,แก้ว,กระจก,หนังสือ,โรงเรียน,หมอ,พยาบาล,หัวใจ,ไฟ,น้ำ,หิมะ,ฝน,พายุ,สายรุ้ง,เมฆ,ลม,ทะเลทราย,เกาะ,ชายหาด,ปลา,วาฬ,ฉลาม,เต่า,สิงโต,เสือ,ม้า,ช้าง,หมี,นก,ผีเสื้อ,แมงมุม,มังกร,ผี,เงา,อวกาศ,จรวด,หุ่นยนต์,ดาวเทียม,นาฬิกา,กุญแจ,ประตู,หน้าต่าง,เก้าอี้,โต๊ะ,กระดาษ,ดินสอ,กล้อง,ขวด,จาน,ช้อน,รองเท้า,หมวก,เสื้อ,แหวน,เปียโน,กีตาร์,กลอง,เพลง,กาแฟ,ชา,นม,ช็อกโกแลต,ส้ม,มะนาว,กล้วย,แอปเปิล,ไข่,ข้าว,น้ำผึ้ง,เกลือ,พริก,สวน,ฟาร์ม,ตลาด,ธนาคาร,วัด,หอคอย,ถ้ำ,แผนที่,โจรสลัด,อัศวิน,ยักษ์,นักสืบ,จดหมาย,โทรศัพท์,คอมพิวเตอร์,เกม,ภาพยนตร์',',');
  end if;
  cap := coalesce((p_data->>'seconds')::int,0);
  if cap not in (0,60,120,180) then raise exception 'เลือกเวลา 0, 60, 120 หรือ 180 วินาที'; end if;
  code := upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,10));
  member := jsonb_build_object('id',extensions.gen_random_uuid(),'name',nickname,'team','spectator','role','spectator');
  s := jsonb_build_object('phase','lobby','members',jsonb_build_object(h,member),'board','[]'::jsonb,'logs','[]'::jsonb,'version',1,'seconds',cap,'language',coalesce(p_data->>'language','th'),'turn','red','clue',null,'guesses',0,'limit',0,'winner',null,'deadline',null);
  insert into jeta_game_private.rooms(code,host,state,words) values(code,h,s,words) returning * into r;
 elsif p_action not in ('join','state','role','start','clue','guess','end','reset','leave','forfeit','challenge') then
  raise exception 'คำสั่งไม่ถูกต้อง';
 else
  select * into r from jeta_game_private.rooms x where x.code=code for update;
  if not found then raise exception 'ไม่พบห้อง ตรวจรหัสห้องอีกครั้ง'; end if;
  s := r.state;
 end if;
 me := s->'members'->h;
 if p_action='join' then
  if me is null then
   if (select count(*) from jsonb_object_keys(s->'members'))>=72 then raise exception 'ห้องเต็มแล้ว'; end if;
   nickname:=trim(p_data->>'name');
   if nickname is null or char_length(nickname) not between 1 and 30 then raise exception 'ใส่ชื่อเล่น 1–30 ตัวอักษร'; end if;
   if (select count(*) from jsonb_object_keys(s->'members'))=0 then r.host:=h;end if;
   me:=jsonb_build_object('id',extensions.gen_random_uuid(),'name',nickname,'team','spectator','role','spectator');
   s:=jsonb_set(s,array['members',h],me); changed:=true;
  end if;
 elsif me is null then raise exception 'เข้าร่วมห้องก่อน'; end if;
 team:=me->>'team'; role_name:=me->>'role';
 -- Expiry uses the database clock; only one request can advance a turn.
 if s->>'phase' in ('clue','guess') and s->>'deadline' is not null and (s->>'deadline')::timestamptz<=clock_timestamp() then
  opponent:=case when s->>'turn'='red' then 'blue' else 'red' end;
  s:=s||jsonb_build_object('turn',opponent,'phase','clue','clue',null,'guesses',0,'limit',0,'deadline',case when (s->>'seconds')::int>0 then clock_timestamp()+make_interval(secs=>(s->>'seconds')::int) else null end);
  s:=jsonb_set(s,'{logs}',(s->'logs')||jsonb_build_array(jsonb_build_object('text','หมดเวลา เปลี่ยนเทิร์น','at',clock_timestamp())));changed:=true;
  -- A stale mutation must not apply to the new turn.
  if p_action in ('clue','guess','end','challenge') then p_action:='state'; end if;
 end if;
 if p_action in ('clue','guess','end','challenge') and (p_data->>'version')::int is distinct from (s->>'version')::int then raise exception 'มีการเปลี่ยนแปลงแล้ว กรุณาลองใหม่'; end if;
 if p_action='role' then
  if s->>'phase'<>'lobby' then raise exception 'เปลี่ยนบทบาทได้ก่อนเริ่มเกมเท่านั้น'; end if;
  team:=p_data->>'team';role_name:=p_data->>'role';
  if team not in ('red','blue','spectator') or role_name not in ('spymaster','operative','spectator') or team is null or role_name is null then raise exception 'บทบาทไม่ถูกต้อง'; end if;
  if (team='spectator')<>(role_name='spectator') then raise exception 'บทบาทไม่ตรงกับทีม'; end if;
  if role_name='spymaster' and exists(select 1 from jsonb_each(s->'members') a where a.key<>h and a.value->>'team'=team and a.value->>'role'='spymaster') then raise exception 'ทีมนี้มีคนใบ้แล้ว'; end if;
  if team<>'spectator' and (select count(*) from jsonb_each(s->'members') a where a.key<>h and a.value->>'team'=team)>=32 then raise exception 'ทีมเต็มแล้ว'; end if;
  me:=me||jsonb_build_object('team',team,'role',role_name);
  s:=jsonb_set(s,array['members',h],me);changed:=true;
 elsif p_action='start' then
  if r.host<>h or s->>'phase'<>'lobby' then raise exception 'เฉพาะเจ้าห้องเริ่มเกมในล็อบบี้ได้'; end if;
  foreach team in array array['red','blue'] loop
   if not exists(select 1 from jsonb_each(s->'members') a where a.value->>'team'=team and a.value->>'role'='spymaster') or not exists(select 1 from jsonb_each(s->'members') a where a.value->>'team'=team and a.value->>'role'='operative') then raise exception 'ต้องมีคนใบ้และคนทายอย่างน้อยทีมละ 1 คน รวม 4 คน'; end if;
  end loop;
  starting:=case when random()<0.5 then 'red' else 'blue' end;
  opponent:=case when starting='red' then 'blue' else 'red' end;
  select array_agg(w) into words from (select w from unnest(r.words) w order by random() limit 25) a;
  select array_agg(c) into colors from (select c from unnest(array_fill(starting,array[9])||array_fill(opponent,array[8])||array_fill('neutral'::text,array[7])||array['assassin']) c order by random()) a;
  board:='[]';for k in 1..25 loop board:=board||jsonb_build_array(jsonb_build_object('word',words[k],'color',colors[k],'revealed',false));end loop;
  s:=s||jsonb_build_object('board',board,'turn',starting,'starting',starting,'phase','clue','clue',null,'guesses',0,'limit',0,'winner',null,'reason',null,'logs',jsonb_build_array(jsonb_build_object('text','เริ่มเกมใหม่','at',clock_timestamp())),'deadline',case when (s->>'seconds')::int>0 then clock_timestamp()+make_interval(secs=>(s->>'seconds')::int) else null end);changed:=true;
 elsif p_action='clue' then
  if s->>'phase'<>'clue' or team<>s->>'turn' or role_name<>'spymaster' then raise exception 'ยังไม่ใช่ตาให้คำใบ้ของคุณ'; end if;
  clue:=trim(p_data->>'word');number_text:=p_data->>'number';
  if clue is null or char_length(clue) not between 1 and 30 or clue~'[[:space:]]' then raise exception 'ใช้คำใบ้ 1 คำ ไม่เว้นวรรค'; end if;
  if number_text is null or number_text not in ('0','1','2','3','4','5','6','7','8','9','unlimited') then raise exception 'จำนวนคำไม่ถูกต้อง'; end if;
  invalid:=exists(select 1 from jsonb_array_elements(s->'board') c where not (c->>'revealed')::boolean and (strpos(lower(c->>'word'),lower(clue))>0 or strpos(lower(clue),lower(c->>'word'))>0));
  s:=jsonb_set(s,'{logs}',(s->'logs')||jsonb_build_array(jsonb_build_object('text',(me->>'name')||' ใบ้: '||clue||' · '||number_text,'at',clock_timestamp())));
  if invalid then
   opponent:=case when team='red' then 'blue' else 'red' end;
   select ordinality::int-1 into chosen from jsonb_array_elements(s->'board') with ordinality a(c,ordinality) where c->>'color'=opponent and not (c->>'revealed')::boolean order by random() limit 1;
   s:=jsonb_set(s,array['board',chosen::text,'revealed'],'true');
   s:=s||jsonb_build_object('turn',opponent,'phase','clue','clue',null,'deadline',case when (s->>'seconds')::int>0 then clock_timestamp()+make_interval(secs=>(s->>'seconds')::int) else null end);
   s:=jsonb_set(s,'{logs}',(s->'logs')||jsonb_build_array(jsonb_build_object('text','คำใบ้ซ้ำหรือเป็นส่วนของคำบนกระดาน จบเทิร์นและเปิดสายลับให้อีกทีม 1 ใบ','at',clock_timestamp())));
  else
   s:=s||jsonb_build_object('phase','guess','clue',jsonb_build_object('word',clue,'number',number_text),'guesses',0,'limit',case when number_text in ('0','unlimited') then 25 else number_text::int+1 end,'deadline',case when (s->>'seconds')::int>0 then clock_timestamp()+make_interval(secs=>(s->>'seconds')::int) else null end);
  end if;changed:=true;
 elsif p_action='guess' then
  if s->>'phase'<>'guess' or role_name<>'operative' or team<>s->>'turn' then raise exception 'ยังไม่ใช่ตาทายของคุณ'; end if;
  chosen:=(p_data->>'index')::int;
  if chosen is null or chosen not between 0 and 24 or (s->'board'->chosen->>'revealed')::boolean then raise exception 'เลือกไพ่ที่ยังไม่เปิด'; end if;
  color:=s->'board'->chosen->>'color';
  s:=jsonb_set(s,array['board',chosen::text,'revealed'],'true');
  guesses:=(s->>'guesses')::int+1;s:=jsonb_set(s,'{guesses}',to_jsonb(guesses));
  s:=jsonb_set(s,'{logs}',(s->'logs')||jsonb_build_array(jsonb_build_object('text',(me->>'name')||' เปิด '||(s->'board'->chosen->>'word')||' · '||case color when 'red' then 'แดง' when 'blue' then 'ฟ้า' when 'assassin' then 'ฆาตกร' else 'ผู้บริสุทธิ์' end,'at',clock_timestamp())));
  opponent:=case when team='red' then 'blue' else 'red' end;
  if color='assassin' then s:=s||jsonb_build_object('phase','finished','winner',opponent,'reason','อีกทีมเปิดไพ่ฆาตกร','deadline',null);
  elsif color<>team or guesses>=(s->>'limit')::int then
   s:=s||jsonb_build_object('turn',opponent,'phase','clue','clue',null,'guesses',0,'limit',0,'deadline',case when (s->>'seconds')::int>0 then clock_timestamp()+make_interval(secs=>(s->>'seconds')::int) else null end);
  end if;changed:=true;
 elsif p_action='end' then
  if s->>'phase'<>'guess' or team<>s->>'turn' or role_name<>'operative' or (s->>'guesses')::int<1 then raise exception 'ต้องทายอย่างน้อย 1 คำก่อนจบเทิร์น'; end if;
  opponent:=case when team='red' then 'blue' else 'red' end;
  s:=s||jsonb_build_object('turn',opponent,'phase','clue','clue',null,'guesses',0,'limit',0,'deadline',case when (s->>'seconds')::int>0 then clock_timestamp()+make_interval(secs=>(s->>'seconds')::int) else null end);
  s:=jsonb_set(s,'{logs}',(s->'logs')||jsonb_build_array(jsonb_build_object('text',(me->>'name')||' จบเทิร์น','at',clock_timestamp())));changed:=true;
 elsif p_action='challenge' then
  if role_name<>'spymaster' or team=s->>'turn' or s->>'phase'<>'guess' or (s->>'guesses')::int<>0 then raise exception 'คนใบ้อีกทีมทักท้วงได้ก่อนมีการทายเท่านั้น'; end if;
  select ordinality::int-1 into chosen from jsonb_array_elements(s->'board') with ordinality a(c,ordinality) where c->>'color'=team and not (c->>'revealed')::boolean order by random() limit 1;
  s:=jsonb_set(s,array['board',chosen::text,'revealed'],'true');
  s:=s||jsonb_build_object('turn',team,'phase','clue','clue',null,'guesses',0,'limit',0,'deadline',case when (s->>'seconds')::int>0 then clock_timestamp()+make_interval(secs=>(s->>'seconds')::int) else null end);
  s:=jsonb_set(s,'{logs}',(s->'logs')||jsonb_build_array(jsonb_build_object('text','ทักท้วงคำใบ้ผิดกติกา จบเทิร์นและเปิดสายลับให้อีกทีม 1 ใบ','at',clock_timestamp())));changed:=true;
 elsif p_action='forfeit' then
  if role_name<>'spymaster' or s->>'phase' not in ('clue','guess') then raise exception 'เฉพาะคนใบ้ยอมแพ้แทนทีมได้'; end if;
  s:=s||jsonb_build_object('phase','finished','winner',case when team='red' then 'blue' else 'red' end,'reason','อีกทีมยอมแพ้','deadline',null);changed:=true;
 elsif p_action='reset' then
  if r.host<>h or s->>'phase'<>'finished' then raise exception 'เฉพาะเจ้าห้องเริ่มรอบใหม่หลังเกมจบได้'; end if;
  s:=s||jsonb_build_object('phase','lobby','board','[]'::jsonb,'winner',null,'deadline',null,'clue',null,'logs','[]'::jsonb);changed:=true;
 elsif p_action='leave' then
  -- Leaving active games preserves the seat so reconnecting cannot change roles.
  if s->>'phase'='lobby' then
   s:=jsonb_set(s,'{members}',(s->'members')-h);
   if r.host=h then select key into r.host from jsonb_each(s->'members') limit 1;r.host:=coalesce(r.host,h);end if;
   update jeta_game_private.rooms x set state=s,host=r.host,updated_at=clock_timestamp() where x.code=code;
   perform realtime.send('{}'::jsonb,'refresh','jeta-game:'||code,false);
  end if;
  return jsonb_build_object('left',true);
 end if;
 -- Both teams are checked: revealing the opponent's last agent also wins.
 if s->>'phase' in ('clue','guess') then
  foreach team in array array['red','blue'] loop
   if not exists(select 1 from jsonb_array_elements(s->'board') c where c->>'color'=team and not (c->>'revealed')::boolean) then
    s:=s||jsonb_build_object('phase','finished','winner',team,'reason','ค้นพบสายลับครบแล้ว','deadline',null);changed:=true;
   end if;
  end loop;
 end if;
 if changed then
  s:=jsonb_set(s,'{version}',to_jsonb((s->>'version')::int+1));
  -- Bound the history payload while keeping recent actions in order.
  if jsonb_array_length(s->'logs')>100 then select jsonb_agg(value order by ordinality) into logs from jsonb_array_elements(s->'logs') with ordinality where ordinality>jsonb_array_length(s->'logs')-100;s:=jsonb_set(s,'{logs}',logs);end if;
  update jeta_game_private.rooms x set state=s,host=r.host,updated_at=clock_timestamp() where x.code=code;
  -- Broadcast only an invalidation hint, never board colors or player secrets.
  perform realtime.send('{}'::jsonb,'refresh','jeta-game:'||code,false);
 end if;
 me:=s->'members'->h;
 select coalesce(jsonb_agg(value||jsonb_build_object('host',key=r.host)),'[]') into members from jsonb_each(s->'members');
 select coalesce(jsonb_agg(jsonb_build_object('word',c->>'word','revealed',(c->>'revealed')::boolean,'color',case when me->>'role'='spymaster' or s->>'phase'='finished' or (c->>'revealed')::boolean then c->>'color' else null end) order by ordinality),'[]') into masked from jsonb_array_elements(s->'board') with ordinality a(c,ordinality);
 result:=(s-'members'-'board')||jsonb_build_object('code',code,'me',me||jsonb_build_object('host',r.host=h),'members',members,'board',masked,'serverTime',clock_timestamp(),'remaining',jsonb_build_object('red',(select count(*) from jsonb_array_elements(s->'board') c where c->>'color'='red' and not (c->>'revealed')::boolean),'blue',(select count(*) from jsonb_array_elements(s->'board') c where c->>'color'='blue' and not (c->>'revealed')::boolean)));
 return result;
end $$;
revoke all on function jeta_game_private.play(uuid,text,text,jsonb) from public;
grant execute on function jeta_game_private.play(uuid,text,text,jsonb) to anon,authenticated;
create function public.jeta_game(p_token uuid,p_action text,p_code text default '',p_data jsonb default '{}')
returns jsonb language sql security invoker set search_path = '' as $$ select jeta_game_private.play(p_token,p_action,p_code,p_data) $$;
revoke all on function public.jeta_game(uuid,text,text,jsonb) from public;
grant execute on function public.jeta_game(uuid,text,text,jsonb) to anon,authenticated;

