-- Generated from db/words-th.json by scripts/build-thai-words.cjs
create or replace function jeta_game_private.thai_words()
returns text[] language sql immutable set search_path = '' as $words$
 select string_to_array('แมว,สุนัข,ช้าง,ม้า,วัว,ควาย,แพะ,แกะ,หมู,กระต่าย,หนู,กระรอก,เม่น,ตุ่น,ค้างคาว,ลิง,ชะนี,กอริลลา,หมี,แพนด้า,เสือ,สิงโต,เสือดาว,หมาป่า,สุนัขจิ้งจอก,กวาง,ยีราฟ,ม้าลาย,อูฐ,จิงโจ้,โคอาลา,ฮิปโป,แรด,สมเสร็จ,นาก,บีเวอร์,จระเข้,เต่า,ตะพาบ,กิ้งก่า,จิ้งจก,ตุ๊กแก,งู,กบ,คางคก,ซาลาแมนเดอร์,ตัวนิ่ม,พังพอน,กระทิง,ละมั่ง,นก,ไก่,เป็ด,ห่าน,หงส์,นกยูง,นกแก้ว,นกฮูก,นกพิราบ,นกกระจอก,นกกระจอกเทศ,นกอินทรี,เหยี่ยว,อีกา,เพนกวิน,ฟลามิงโก,นกกระเรียน,นกนางนวล,นกเงือก,นกหัวขวาน,ผีเสื้อ,ผึ้ง,ต่อ,แตน,มด,ปลวก,ยุง,แมลงวัน,แมลงสาบ,แมลงปอ,ตั๊กแตน,จิ้งหรีด,จักจั่น,หิ่งห้อย,ด้วง,หนอน,ดักแด้,แมงมุม,แมงป่อง,ตะขาบ,กิ้งกือ,แมงดา,ตั๊กแตนตำข้าว,แมลงทับ,แมลงเต่าทอง,ปลา,วาฬ,โลมา,ฉลาม,ปลากระเบน,ปลาหมึก,แมงกะพรุน,ม้าน้ำ,ปะการัง,ปลาดาว,เม่นทะเล,หอย,กุ้ง,ปู,ล็อบสเตอร์,เพรียง,ปลิง,ปลาไหล,ปลาทอง,ปลากัด,ปลาคาร์ป,ปลาดุก,ปลาช่อน,ปลาทู,ปลากะพง,ปลานิล,ปลาสลิด,ปลาซาร์ดีน,ปลาทูน่า,ปลาแซลมอน,ปลาปักเป้า,ปลาการ์ตูน,ปลาบิน,ปลานกแก้ว,ปลาสิงโต,พะยูน,แมวน้ำ,สิงโตทะเล,วอลรัส,เคย,ทะเล,ภูเขา,แม่น้ำ,ลำธาร,น้ำตก,ทะเลสาบ,บึง,หนองน้ำ,มหาสมุทร,เกาะ,ชายหาด,อ่าว,แหลม,หน้าผา,ถ้ำ,หุบเขา,ทุ่งหญ้า,ป่า,ทะเลทราย,โอเอซิส,ภูเขาไฟ,ธารน้ำแข็ง,บ่อน้ำพุร้อน,น้ำพุ,โคลน,ดิน,ทราย,หิน,กรวด,แร่,ผลึก,เปลือกหอย,ฟอสซิล,ไฟ,ลาวา,ขี้เถ้า,ควัน,หมอก,เมฆ,ฝน,หิมะ,ลูกเห็บ,น้ำค้าง,น้ำแข็ง,ลม,พายุ,สายฟ้า,ฟ้าร้อง,สายรุ้ง,แผ่นดินไหว,สึนามิ,น้ำท่วม,คลื่น,กระแสน้ำ,ขอบฟ้า,ต้นไม้,ใบไม้,กิ่งไม้,รากไม้,เมล็ด,หน่อไม้,ไผ่,สน,สัก,ยางพารา,มะพร้าว,ปาล์ม,กระบองเพชร,เฟิร์น,มอส,สาหร่าย,เห็ด,หญ้า,บัว,กุหลาบ,มะลิ,กล้วยไม้,ทานตะวัน,ดาวเรือง,ชบา,ลีลาวดี,เข็ม,พุด,จำปี,จำปา,ซากุระ,ทิวลิป,ลาเวนเดอร์,เบญจมาศ,ดอกแก้ว,อัญชัน,พวงชมพู,เฟื่องฟ้า,กระดังงา,ราชพฤกษ์,หางนกยูง,จามจุรี,โพธิ์,ไทร,เกสร,กลีบดอก,เปลือกไม้,เถาวัลย์,ดอกไม้,ส้ม,มะนาว,กล้วย,แอปเปิล,มะม่วง,มังคุด,ทุเรียน,เงาะ,ลำไย,ลิ้นจี่,สับปะรด,แตงโม,แตงไทย,แคนตาลูป,เมลอน,สตรอว์เบอร์รี,องุ่น,ลูกแพร์,ลูกพีช,ลูกพลับ,เชอร์รี,กีวี,อะโวคาโด,เสาวรส,ชมพู่,ฝรั่ง,ขนุน,น้อยหน่า,กระท้อน,ลองกอง,สละ,ระกำ,มะละกอ,มะขาม,มะยม,มะเฟือง,มะไฟ,พุทรา,ลูกตาล,อินทผลัม,เกาลัด,ข้าวโพด,ฟักทอง,แตงกวา,มะเขือ,มะเขือเทศ,พริก,กะหล่ำปลี,คะน้า,ผักบุ้ง,ผักกาด,บรอกโคลี,แครอต,มันฝรั่ง,มันเทศ,เผือก,หัวไชเท้า,หอมแดง,หอมหัวใหญ่,กระเทียม,ขิง,ข่า,ตะไคร้,ใบมะกรูด,กะเพรา,โหระพา,สะระแหน่,ผักชี,ต้นหอม,ถั่วงอก,ข้าว,ข้าวเหนียว,โจ๊ก,ข้าวต้ม,ข้าวผัด,ข้าวมันไก่,ข้าวหมูแดง,ข้าวขาหมู,ก๋วยเตี๋ยว,ผัดไทย,ผัดซีอิ๊ว,ราดหน้า,สุกี้,ชาบู,หมูกระทะ,ส้มตำ,ลาบ,น้ำตกหมู,ไก่ย่าง,หมูปิ้ง,ไส้กรอก,ลูกชิ้น,เกี๊ยว,บะหมี่,ขนมจีน,แกงเขียวหวาน,แกงส้ม,แกงจืด,ต้มยำ,ต้มข่า,พะแนง,มัสมั่น,ไข่,ไข่เจียว,ไข่ดาว,ไข่ต้ม,ไข่เค็ม,เต้าหู้,ปลาเค็ม,ปลาร้า,กะปิ,น้ำพริก,หมูหย็อง,เบคอน,แฮม,สเต๊ก,พิซซ่า,แฮมเบอร์เกอร์,แซนด์วิช,สปาเกตตี,ซูชิ,ซาชิมิ,ราเมง,เทมปุระ,กิมจิ,ต็อกบกกี,สลัด,ซุป,เฟรนช์ฟรายส์,เนย,ชีส,โยเกิร์ต,ขนมปัง,ครัวซองต์,แป้ง,น้ำตาล,เกลือ,น้ำปลา,ซีอิ๊ว,ซอส,น้ำมัน,พริกไทย,งา,ถั่วลิสง,อัลมอนด์,กาแฟ,ชา,นม,น้ำ,น้ำผึ้ง,ช็อกโกแลต,โกโก้,น้ำส้ม,น้ำมะพร้าว,น้ำอ้อย,น้ำเต้าหู้,น้ำแดง,น้ำโซดา,น้ำอัดลม,ชาเขียว,ชาไทย,ชานม,ไข่มุก,โอเลี้ยง,เฉาก๊วย,ไอศกรีม,น้ำแข็งไส,บิงซู,ลอดช่อง,ทับทิมกรอบ,บัวลอย,เต้าส่วน,ข้าวเหนียวมะม่วง,ขนมครก,ขนมเบื้อง,ทองหยิบ,ทองหยอด,ฝอยทอง,เม็ดขนุน,ลูกชุบ,วุ้น,ขนมชั้น,ขนมต้ม,ขนมเทียน,ขนมเข่ง,โรตี,สายไหม,โดนัท,เค้ก,คุกกี้,บราวนี,พุดดิง,เยลลี,ลูกอม,หมากฝรั่ง,มาร์ชเมลโลว์,ป๊อปคอร์น,วาฟเฟิล,แพนเค้ก,พาย,ทาร์ต,เอแคลร์,มาการอง,ข้าวแต๋น,กล้วยฉาบ,บ้าน,ประตู,หน้าต่าง,บันได,หลังคา,กำแพง,รั้ว,พื้น,เพดาน,ระเบียง,สวน,ห้องนอน,ห้องครัว,ห้องน้ำ,เตียง,ที่นอน,หมอน,ผ้าห่ม,มุ้ง,เต็นท์,ตู้,ลิ้นชัก,ชั้นวาง,โต๊ะ,เก้าอี้,โซฟา,เปล,พรม,เสื่อ,ผ้าม่าน,กระจก,แจกัน,กระถาง,กรอบรูป,ปฏิทิน,นาฬิกา,โคมไฟ,หลอดไฟ,พัดลม,เครื่องปรับอากาศ,โทรทัศน์,วิทยุ,ตู้เย็น,เครื่องซักผ้า,เตารีด,เครื่องดูดฝุ่น,ไมโครเวฟ,เตาอบ,หม้อหุงข้าว,กาต้มน้ำ,เครื่องปั่น,ถังขยะ,ไม้กวาด,ที่โกยผง,ไม้ถูพื้น,ฟองน้ำ,ถังน้ำ,กะละมัง,สายยาง,ก๊อกน้ำ,ฝักบัว,อ่างล้างหน้า,อ่างอาบน้ำ,ชักโครก,สบู่,ยาสีฟัน,แปรงสีฟัน,ผ้าขนหนู,หวี,กรรไกร,มีดโกน,ไดร์เป่าผม,จาน,ชาม,ถ้วย,แก้ว,ช้อน,ส้อม,มีด,ตะเกียบ,ทัพพี,ตะหลิว,กระบวย,กระทะ,หม้อ,ฝาหม้อ,เขียง,ครก,สาก,ตะแกรง,กระชอน,ที่คีบ,ที่เปิดขวด,ที่เปิดกระป๋อง,ที่ขูด,ที่ปอกผลไม้,กระติกน้ำ,กระติกน้ำแข็ง,ขวด,โหล,กระป๋อง,กล่อง,ถุง,ตะกร้า,ถาด,จุกก๊อก,หลอด,ผ้ากันเปื้อน,ถุงมือ,แก๊ส,เตาถ่าน,ถ่าน,ไม้ขีดไฟ,ไฟแช็ก,เทียน,เชิงเทียน,ตาชั่ง,เสื้อ,กางเกง,กระโปรง,ชุดเดรส,สูท,เสื้อคลุม,เสื้อกันฝน,เสื้อกันหนาว,ชุดนอน,ชุดว่ายน้ำ,ชุดนักเรียน,ชุดเกราะ,รองเท้า,รองเท้าบูต,รองเท้าแตะ,ถุงเท้า,เข็มขัด,หมวก,หมวกกันน็อก,ผ้าพันคอ,เนกไท,โบ,ผ้าเช็ดหน้า,กระเป๋า,กระเป๋าสตางค์,กระเป๋าเป้,กระเป๋าเดินทาง,ร่ม,แว่นตา,แว่นกันแดด,หน้ากาก,แหวน,สร้อยคอ,กำไล,ต่างหู,เข็มกลัด,มงกุฎ,กิ๊บ,ยางรัดผม,กุญแจ,แม่กุญแจ,ซิป,กระดุม,ด้าย,ผ้าไหม,ผ้าฝ้าย,ขนสัตว์,ลูกไม้,น้ำหอม,ค้อน,ตะปู,สกรู,ไขควง,ประแจ,คีม,เลื่อย,สว่าน,ขวาน,เคียว,จอบ,เสียม,พลั่ว,คราด,บันไดพาด,เชือก,โซ่,ลวด,ตาข่าย,รอก,สปริง,เฟือง,ลูกปืน,นอต,ท่อ,วาล์ว,ปั๊มน้ำ,เครื่องยนต์,มอเตอร์,แบตเตอรี่,ถ่านไฟฉาย,ไฟฉาย,ปลั๊กไฟ,สายไฟ,ฟิวส์,สวิตช์,หลอดทดลอง,บีกเกอร์,กรวย,แม่เหล็ก,ทอง,เงิน,เพชร,เหล็ก,ทองแดง,ทองเหลือง,อะลูมิเนียม,ดีบุก,ตะกั่ว,สังกะสี,ปรอท,พลาสติก,ยาง,หนัง,ไม้,ปูน,อิฐ,กระเบื้อง,ซีเมนต์,กาว,เทป,สี,พู่กัน,แปรง,น้ำมันหล่อลื่น,รถไฟ,เครื่องบิน,เรือ,รถยนต์,รถจักรยานยนต์,จักรยาน,รถเมล์,แท็กซี่,รถตู้,รถบรรทุก,รถพ่วง,รถแทรกเตอร์,รถถัง,รถพยาบาล,รถดับเพลิง,รถตำรวจ,รถแข่ง,รถเข็น,รถลาก,สามล้อ,ตุ๊กตุ๊ก,รถไฟฟ้า,รถใต้ดิน,รถราง,กระเช้า,เคเบิลคาร์,เฮลิคอปเตอร์,เครื่องร่อน,บอลลูน,เรือดำน้ำ,เรือใบ,เรือพาย,เรือแคนู,เรือคายัก,แพ,เจ็ตสกี,จรวด,ยานอวกาศ,จานบิน,โดรน,รันเวย์,สนามบิน,ท่าเรือ,สถานี,ป้ายรถเมล์,ชานชาลา,ถนน,ทางด่วน,ทางม้าลาย,สี่แยก,วงเวียน,สะพาน,อุโมงค์,ทางรถไฟ,ไฟจราจร,ป้ายทาง,ล้อ,ยางรถ,พวงมาลัย,เบรก,คันเร่ง,เข็มทิศ,แผนที่,ตั๋ว,หนังสือเดินทาง,ปราสาท,โรงเรียน,มหาวิทยาลัย,ห้องสมุด,พิพิธภัณฑ์,หอศิลป์,โรงละคร,โรงภาพยนตร์,ห้าง,ตลาด,ตลาดนัด,ร้านค้า,ร้านหนังสือ,ร้านยา,ร้านอาหาร,ร้านกาแฟ,โรงแรม,รีสอร์ต,โรงพยาบาล,คลินิก,ธนาคาร,ไปรษณีย์,สถานีตำรวจ,ศาล,เรือนจำ,ค่ายทหาร,โรงงาน,โกดัง,อู่รถ,ปั๊มน้ำมัน,สวนสาธารณะ,สวนสนุก,สวนสัตว์,สวนน้ำ,สนามเด็กเล่น,สนามกีฬา,สระว่ายน้ำ,โรงยิม,ฟาร์ม,ทุ่งนา,ไร่,โรงนา,กังหันลม,เขื่อน,โรงไฟฟ้า,เหมือง,ท่าอวกาศยาน,หอดูดาว,หอคอย,ประภาคาร,วัด,โบสถ์,มัสยิด,ศาลเจ้า,สุสาน,เจดีย์,พระราชวัง,ป้อมปราการ,หมู่บ้าน,เมือง,นคร,ประเทศ,ชายแดน,สถานทูต,ทวีป,หมอ,พยาบาล,ทันตแพทย์,เภสัชกร,สัตวแพทย์,ครู,อาจารย์,นักเรียน,นักศึกษา,นักวิทยาศาสตร์,วิศวกร,สถาปนิก,โปรแกรมเมอร์,นักออกแบบ,จิตรกร,ช่างภาพ,นักเขียน,นักข่าว,บรรณารักษ์,นักแปล,นักบัญชี,ทนายความ,ผู้พิพากษา,ตำรวจ,ทหาร,นักดับเพลิง,นักบิน,นักบินอวกาศ,กัปตัน,กะลาสี,ชาวประมง,ชาวนา,ชาวสวน,คนเลี้ยงสัตว์,คนขับรถ,บุรุษไปรษณีย์,ช่างไม้,ช่างไฟ,ช่างประปา,ช่างซ่อมรถ,ช่างตัดผม,ช่างเย็บผ้า,พ่อครัว,แม่ค้า,พ่อค้า,พนักงานเสิร์ฟ,นักร้อง,นักดนตรี,นักเต้น,นักแสดง,ผู้กำกับ,นักกีฬา,กรรมการ,โค้ช,นักมายากล,ตัวตลก,นักสืบ,สายลับ,โจรสลัด,อัศวิน,ราชา,ราชินี,เจ้าชาย,เจ้าหญิง,จักรพรรดิ,ขุนนาง,นักบวช,พระ,ช่างปั้น,นักโบราณคดี,ฟุตบอล,บาสเกตบอล,วอลเลย์บอล,แบดมินตัน,เทนนิส,ปิงปอง,กอล์ฟ,เบสบอล,รักบี้,คริกเก็ต,ฮอกกี้,สนุกเกอร์,โบว์ลิง,เปตอง,ตะกร้อ,มวย,คาราเต้,ยูโด,เทควันโด,ฟันดาบ,ยิงธนู,ยิงปืน,ยิมนาสติก,ว่ายน้ำ,ดำน้ำ,พายเรือ,แล่นเรือ,โต้คลื่น,สกี,สเกต,สเกตบอร์ด,วิ่ง,กระโดดสูง,กระโดดไกล,ทุ่มน้ำหนัก,ขี่ม้า,ปีนเขา,ตกปลา,ตั้งแคมป์,เดินป่า,ปั่นจักรยาน,โยคะ,หมากรุก,หมากฮอส,โดมิโน,ไพ่,ลูกเต๋า,บิงโก,ปริศนา,จิ๊กซอว์,ว่าว,ลูกข่าง,โยโย่,ชิงช้า,สไลเดอร์,ม้าหมุน,รถไฟเหาะ,ลูกบอล,ตาข่ายประตู,ไม้เบสบอล,แร็กเกต,นกหวีด,ถ้วยรางวัล,เหรียญรางวัล,เส้นชัย,เปียโน,กีตาร์,กลอง,ไวโอลิน,เชลโล,ฮาร์ป,อูคูเลเล่,เบส,ขลุ่ย,แซกโซโฟน,ทรัมเป็ต,ทรอมโบน,คลาริเน็ต,หีบเพลง,เมโลเดียน,ระนาด,ฆ้อง,ฉิ่ง,ฉาบ,ซอ,แคน,พิณ,จะเข้,ปี่,ไมโครโฟน,ลำโพง,หูฟัง,เวที,ม่าน,สปอตไลต์,คอนเสิร์ต,วงออร์เคสตรา,เพลง,ทำนอง,จังหวะ,โน้ต,เสียง,ภาพวาด,ภาพถ่าย,ภาพยนตร์,การ์ตูน,ละคร,นิยาย,บทกวี,ประติมากรรม,หุ่นกระบอก,หน้ากากโขน,โขน,ลิเก,บัลเลต์,คณะละคร,โรงพิมพ์,ฟิล์ม,พู่กันจีน,ผ้าใบ,หนังสือ,สมุด,กระดาษ,ดินสอ,ปากกา,ยางลบ,ไม้บรรทัด,ไม้โปรแทรกเตอร์,ลูกคิด,เครื่องคิดเลข,กระดานดำ,ชอล์ก,ปากกาเมจิก,คลิป,ลวดเย็บ,แฟ้ม,ซองจดหมาย,จดหมาย,แสตมป์,พัสดุ,พจนานุกรม,สารานุกรม,ลูกโลก,กล้อง,กล้องจุลทรรศน์,กล้องโทรทรรศน์,กล้องส่องทางไกล,คอมพิวเตอร์,โทรศัพท์,แท็บเล็ต,แล็ปท็อป,แป้นพิมพ์,เมาส์,จอภาพ,เครื่องพิมพ์,สแกนเนอร์,เราเตอร์,โมเด็ม,เสาอากาศ,ดาวเทียม,หุ่นยนต์,ชิป,วงจร,เซนเซอร์,เลเซอร์,เรดาร์,โซนาร์,อินเทอร์เน็ต,เว็บไซต์,แอป,เกม,โปรแกรม,รหัสผ่าน,บาร์โค้ด,คิวอาร์โค้ด,แผ่นเสียง,เทปคาสเซ็ต,ซีดี,แฟลชไดรฟ์,ฮาร์ดดิสก์,สายชาร์จ,รีโมต,พลังงาน,ไฟฟ้า,หัว,ผม,หน้า,หน้าผาก,คิ้ว,ตา,หู,จมูก,ปาก,ฟัน,ลิ้น,คาง,แก้ม,คอ,ไหล่,แขน,ศอก,ข้อมือ,มือ,นิ้ว,เล็บ,อก,หลัง,เอว,สะโพก,ขา,เข่า,ข้อเท้า,เท้า,ส้นเท้า,หัวใจ,ปอด,สมอง,ตับ,ไต,กระเพาะ,ลำไส้,กระดูก,กล้ามเนื้อ,ผิวหนัง,เลือด,เส้นเลือด,เส้นประสาท,น้ำตา,เหงื่อ,ลมหายใจ,ชีพจร,วัคซีน,ยา,เข็มฉีดยา,ปรอทวัดไข้,ผ้าพันแผล,พลาสเตอร์,ไม้เท้า,ไม้ค้ำยัน,รถเข็นผู้ป่วย,เปลพยาบาล,เครื่องเอกซเรย์,หูฟังแพทย์,หน้ากากอนามัย,ดวงจันทร์,ดวงอาทิตย์,ดาว,ดาวพุธ,ดาวศุกร์,โลก,ดาวอังคาร,ดาวพฤหัสบดี,ดาวเสาร์,ดาวยูเรนัส,ดาวเนปจูน,ดาวพลูโต,ดาวหาง,ดาวตก,อุกกาบาต,ดาวเคราะห์,ดาวฤกษ์,กลุ่มดาว,ทางช้างเผือก,กาแล็กซี,เนบิวลา,หลุมดำ,จักรวาล,อวกาศ,วงโคจร,สุริยุปราคา,จันทรุปราคา,แรงโน้มถ่วง,แรงเสียดทาน,แสง,เงา,ความร้อน,ความเย็น,อุณหภูมิ,มวล,น้ำหนัก,ความเร็ว,เวลา,อะตอม,โมเลกุล,อิเล็กตรอน,โปรตอน,นิวตรอน,ไฮโดรเจน,ออกซิเจน,คาร์บอน,ไนโตรเจน,ฮีเลียม,กรด,ด่าง,กัมมันตรังสี,พลังงานแสงอาทิตย์,สนามแม่เหล็ก,คลื่นวิทยุ,เสียงสะท้อน,มังกร,ยักษ์,ผี,นางฟ้า,เทวดา,ปีศาจ,พ่อมด,แม่มด,นางเงือก,ยูนิคอร์น,กริฟฟิน,ฟีนิกซ์,เพกาซัส,เซนทอร์,มนุษย์หมาป่า,แวมไพร์,ซอมบี,มัมมี่,โครงกระดูก,แฟรงเกนสไตน์,ไม้กายสิทธิ์,ดาบ,หอก,โล่,ธนู,ลูกธนู,คทา,ตรีศูล,กระบอง,ค้อนวิเศษ,พรมวิเศษ,ตะเกียงวิเศษ,กระจกวิเศษ,ยาวิเศษ,ปราสาททราย,มงกุฎหนาม,สมบัติ,หีบสมบัติ,แผนที่สมบัติ,คำสาป,เวทมนตร์,คาถา,มิติเวลา,ประตูมิติ,นรก,สวรรค์,บาดาล,เขาวงกต,ม้าโทรจัน,เมืองลับแล,พญานาค,ครุฑ,กินรี,หนุมาน,ไซเรน,จินนี,อสูร,สัตว์ประหลาด,มนุษย์ต่างดาว,สงกรานต์,ลอยกระทง,ตรุษจีน,คริสต์มาส,ฮาโลวีน,ปีใหม่,วาเลนไทน์,วันเกิด,งานแต่งงาน,งานบวช,งานวัด,งานเลี้ยง,งานศพ,ขบวนแห่,กระทง,โคมลอย,โคมแดง,ประทัด,พลุ,ดอกไม้ไฟ,บายศรี,ธูป,เทียนพรรษา,บาตร,จีวร,พระพุทธรูป,ระฆัง,กลองยาว,ฉัตร,ธง,ตรา,เหรียญ,เงินตรา,ธนบัตร,สลาก,ของขวัญ,ริบบิ้น,ลูกโป่ง,การ์ดอวยพร,อั่งเปา,ซอง,หน้ากากผี,ฟักทองแกะสลัก,ต้นคริสต์มาส,ซานตาคลอส,รถเลื่อน,ตุ๊กตาหิมะ,ถุงของขวัญ,ไข่อีสเตอร์,ความฝัน,ความลับ,ความรัก,ความหวัง,ความกลัว,ความสุข,ความเศร้า,ความทรงจำ,โชค,ชะตา,โอกาส,อนาคต,อดีต,ปัจจุบัน,ประวัติศาสตร์,สันติภาพ,สงคราม,ชัยชนะ,ความพ่ายแพ้,เสรีภาพ,ความยุติธรรม,กฎหมาย,สัญญา,คำถาม,คำตอบ,เบาะแส,หลักฐาน,เหตุผล,จินตนาการ,แรงบันดาลใจ,ความเงียบ,ความมืด,ความสว่าง,รอยยิ้ม,เสียงหัวเราะ,คำสัญญา,การเดินทาง,การผจญภัย,การค้นพบ,การแข่งขัน,ความร่วมมือ,การแลกเปลี่ยน,ความสมดุล,จุดเริ่มต้น,จุดจบ,วงกลม,สามเหลี่ยม,สี่เหลี่ยม,เส้นตรง,เส้นโค้ง,มุม,จุด,ช่อง,แถว,คิว,ขัน,ใบ,ลูก,ยอด,รอบ,ชั้น,สาย,ดอกเบี้ย,ต้นทุน,กำไร,หนี้,ภาษี,บัญชี', ',')
$words$;
revoke all on function jeta_game_private.thai_words() from public, anon, authenticated;

create or replace function jeta_game_private.play(p_token uuid, p_action text, p_code text default '', p_data jsonb default '{}')
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
   words := jeta_game_private.thai_words();
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
 result:=(s-'members'-'board')||jsonb_build_object('code',code,'wordCount',cardinality(r.words),'me',me||jsonb_build_object('host',r.host=h),'members',members,'board',masked,'serverTime',clock_timestamp(),'remaining',jsonb_build_object('red',(select count(*) from jsonb_array_elements(s->'board') c where c->>'color'='red' and not (c->>'revealed')::boolean),'blue',(select count(*) from jsonb_array_elements(s->'board') c where c->>'color'='blue' and not (c->>'revealed')::boolean)));
 return result;
end $$;

-- Update future rounds in existing Thai rooms; active boards stay unchanged.
update jeta_game_private.rooms set words=jeta_game_private.thai_words() where state->>'language'='th';
