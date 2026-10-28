-- Run in a transaction. All rooms, actions and broadcast hints roll back.
begin;
set local role anon;
do $$
#variable_conflict use_variable
declare
 a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();c uuid:=gen_random_uuid();d uuid:=gen_random_uuid();e uuid:=gen_random_uuid();outsider uuid:=gen_random_uuid();
 s jsonb;spy jsonb;viewed jsonb;code text;active text;actor uuid;master uuid;enemy uuid;idx int;blocked boolean;round int;target text;remaining int;
begin
 s:=public.jeta_game(a,'create','',jsonb_build_object('name','QA red spy','language','th','seconds',0));code:=s->>'code';
 perform public.jeta_game(b,'join',code,'{"name":"QA red operative"}');perform public.jeta_game(c,'join',code,'{"name":"QA blue spy"}');perform public.jeta_game(d,'join',code,'{"name":"QA blue operative"}');perform public.jeta_game(e,'join',code,'{"name":"QA spectator"}');
 perform public.jeta_game(a,'role',code,'{"team":"red","role":"spymaster"}');perform public.jeta_game(b,'role',code,'{"team":"red","role":"operative"}');perform public.jeta_game(c,'role',code,'{"team":"blue","role":"spymaster"}');perform public.jeta_game(d,'role',code,'{"team":"blue","role":"operative"}');
 blocked:=false;begin perform public.jeta_game(e,'role',code,'{"team":"red","role":"spymaster"}');exception when others then blocked:=true;end;assert blocked,'one spymaster per team';
 blocked:=false;begin perform public.jeta_game(outsider,'state',code);exception when others then blocked:=true;end;assert blocked,'outsider cannot read state';
 blocked:=false;begin perform state from jeta_game_private.rooms;exception when insufficient_privilege then blocked:=true;end;assert blocked,'no direct table reads';
 for round in 1..7 loop
  spy:=public.jeta_game(a,'start',code);active:=spy->>'turn';master:=case when active='red' then a else c end;actor:=case when active='red' then b else d end;enemy:=case when active='red' then c else a end;
  assert jsonb_array_length(spy->'board')=25,'25 cards';
  assert (select count(*)=9 from jsonb_array_elements(spy->'board') x where x->>'color'=active),'starting team 9';
  assert (select count(*)=7 from jsonb_array_elements(spy->'board') x where x->>'color'='neutral'),'7 neutral';
  assert (select count(*)=1 from jsonb_array_elements(spy->'board') x where x->>'color'='assassin'),'1 assassin';
  viewed:=public.jeta_game(actor,'state',code);assert not exists(select 1 from jsonb_array_elements(viewed->'board') x where x->>'color' is not null),'operative never receives hidden key';
  viewed:=public.jeta_game(e,'state',code);assert not exists(select 1 from jsonb_array_elements(viewed->'board') x where x->>'color' is not null),'spectator never receives hidden key';
  blocked:=false;begin perform public.jeta_game(b,'role',code,'{"team":"blue","role":"spymaster"}');exception when others then blocked:=true;end;assert blocked,'no role changes during match';
  blocked:=false;begin perform public.jeta_game(actor,'clue',code,jsonb_build_object('version',spy->'version','word','ทดสอบ','number','1'));exception when others then blocked:=true;end;assert blocked,'operative cannot give clue';
  if round=5 then
   s:=public.jeta_game(master,'clue',code,jsonb_build_object('version',spy->'version','word',spy->'board'->0->>'word','number','1'));
   assert s->>'phase'='clue' and s->>'turn'<>active,'invalid clue ends turn';
   assert (select count(*)=1 from jsonb_array_elements(s->'board') x where (x->>'revealed')::boolean),'invalid clue penalty reveals one';
  else
   s:=public.jeta_game(master,'clue',code,jsonb_build_object('version',spy->'version','word','ทดสอบ','number',case when round=4 then 'unlimited' else '1' end));
   assert s->>'phase'='guess','clue begins guessing';
   blocked:=false;begin perform public.jeta_game(actor,'end',code,jsonb_build_object('version',s->'version'));exception when others then blocked:=true;end;assert blocked,'must guess once';
   blocked:=false;begin perform public.jeta_game(e,'guess',code,jsonb_build_object('version',s->'version','index',0));exception when others then blocked:=true;end;assert blocked,'spectator cannot guess';
   if round=6 then
    s:=public.jeta_game(enemy,'challenge',code,jsonb_build_object('version',s->'version'));assert s->>'turn'<>active and s->>'phase'='clue','challenge changes turn';
   elsif round=7 then
    select ordinality::int-1 into idx from jsonb_array_elements(spy->'board') with ordinality x(v,ordinality) where v->>'color'=active limit 1;
    blocked:=false;begin perform public.jeta_game(actor,'guess',code,jsonb_build_object('version',0,'index',idx));exception when others then blocked:=true;end;assert blocked,'stale actions rejected';
    s:=public.jeta_game(actor,'guess',code,jsonb_build_object('version',s->'version','index',idx));
    s:=public.jeta_game(actor,'end',code,jsonb_build_object('version',s->'version'));assert s->>'turn'<>active,'manual end after one guess';
   else
    target:=case round when 1 then 'neutral' when 2 then case when active='red' then 'blue' else 'red' end when 3 then 'assassin' else active end;
    for idx in select ordinality::int-1 from jsonb_array_elements(spy->'board') with ordinality x(v,ordinality) where v->>'color'=target loop
     s:=public.jeta_game(actor,'guess',code,jsonb_build_object('version',s->'version','index',idx));exit when round<>4;
    end loop;
    if round in (1,2) then assert s->>'phase'='clue' and s->>'turn'<>active,'wrong color ends turn';end if;
    if round=3 then assert s->>'phase'='finished' and s->>'winner'<>active,'assassin loses';end if;
    if round=4 then assert s->>'phase'='finished' and s->>'winner'=active,'all agents wins';end if;
   end if;
  end if;
  if s->>'phase'<>'finished' then s:=public.jeta_game(master,'forfeit',code);end if;
  assert s->>'phase'='finished','finished state';
  s:=public.jeta_game(b,'state',code);assert not exists(select 1 from jsonb_array_elements(s->'board') x where x->>'color' is null),'finished reveals all';
  s:=public.jeta_game(a,'reset',code);assert s->>'phase'='lobby','host can replay';
 end loop;
 -- n + 1 quota
 spy:=public.jeta_game(a,'start',code);active:=spy->>'turn';master:=case when active='red' then a else c end;actor:=case when active='red' then b else d end;
 s:=public.jeta_game(master,'clue',code,jsonb_build_object('version',spy->'version','word','ทดสอบ','number','1'));
 for idx in select ordinality::int-1 from jsonb_array_elements(spy->'board') with ordinality x(v,ordinality) where v->>'color'=active limit 2 loop
  s:=public.jeta_game(actor,'guess',code,jsonb_build_object('version',s->'version','index',idx));
 end loop;
 assert s->>'turn'<>active and s->>'phase'='clue','clue 1 permits 2 guesses then ends';
 -- Reconnect returns the same seat and no keys.
 s:=public.jeta_game(b,'join',code,'{"name":"different name"}');assert s->'me'->>'name'='QA red operative','reconnect keeps identity';
end $$;
reset role;
do $$
#variable_conflict use_variable
declare a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();c uuid:=gen_random_uuid();d uuid:=gen_random_uuid();e uuid:=gen_random_uuid();s jsonb;code text;words jsonb;active text;master uuid;actor uuid;blocked boolean;
begin
 select jsonb_agg('word'||i) into words from generate_series(1,30) i;
 s:=public.jeta_game(a,'create','',jsonb_build_object('name','QA timer','language','custom','seconds',60,'words',words));code:=s->>'code';
 perform public.jeta_game(a,'role',code,'{"team":"red","role":"spymaster"}');
 perform public.jeta_game(b,'join',code,'{"name":"b"}');perform public.jeta_game(b,'role',code,'{"team":"red","role":"operative"}');
 perform public.jeta_game(c,'join',code,'{"name":"c"}');perform public.jeta_game(c,'role',code,'{"team":"blue","role":"spymaster"}');
 perform public.jeta_game(d,'join',code,'{"name":"d"}');perform public.jeta_game(d,'role',code,'{"team":"blue","role":"operative"}');
 s:=public.jeta_game(a,'start',code);active:=s->>'turn';master:=case when active='red' then a else c end;
 assert s->>'deadline' is not null,'timer creates server deadline';
 assert not exists(select 1 from jsonb_array_elements(s->'board') x where x->>'word' not like 'word%'),'custom deck used';
 update jeta_game_private.rooms x set state=jsonb_set(state,'{deadline}',to_jsonb(clock_timestamp()-interval '1 second')) where x.code=code;
 s:=public.jeta_game(master,'clue',code,jsonb_build_object('version',s->'version','word','test','number','1'));
 assert s->>'phase'='clue' and s->>'turn'<>active,'expiry advances turn and ignores stale command';
 master:=case when s->>'turn'='red' then a else c end;
 s:=public.jeta_game(master,'clue',code,jsonb_build_object('version',s->'version','word','test','number','0'));
 assert (s->>'limit')::int=25,'zero clue permits unlimited guesses';
 blocked:=false;begin perform public.jeta_game(e,'create','',jsonb_build_object('name','QA bad deck','language','custom','words',jsonb_build_array('one','one'),'seconds',0));exception when others then blocked:=true;end;assert blocked,'custom deck minimum enforced';
 s:=public.jeta_game(e,'create','','{"name":"QA host","seconds":0}');code:=s->>'code';perform public.jeta_game(e,'leave',code);
 s:=public.jeta_game(a,'join',code,'{"name":"new host"}');assert (s->'me'->>'host')::boolean,'empty room adopts first returning player as host';
end $$;
rollback;
