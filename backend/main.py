import os
import uuid
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import models
from database import engine, SessionLocal
from routers import orders, prep, menu, dashboard, external, setup, inventory, cooking_history, predict, tasks_now
from websocket_manager import manager

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# DBテーブルを起動時に自動作成
models.Base.metadata.create_all(bind=engine)


def _j(translations: dict) -> str:
    """多言語辞書をJSON文字列に変換するヘルパー"""
    return json.dumps(translations, ensure_ascii=False)


def seed_demo_data():
    """デモデータを多言語JSON形式でセットアップ（既存データが古い形式なら再シード）"""
    db = SessionLocal()
    try:
        # i18n形式チェック: 既存データがJSON+jaキーなら再シード不要
        first_step = db.query(models.MenuStep).first()
        if first_step:
            try:
                parsed = json.loads(first_step.description or "")
                if isinstance(parsed, dict) and "ja" in parsed:
                    return  # 既にi18n形式
            except Exception:
                pass
            # 旧形式: メニュー/ステップを全削除して再シード
            db.query(models.MenuStep).delete()
            db.query(models.Menu).delete()
            db.commit()
            print("[DEMO] Migrating descriptions to i18n format...")

        # ── 材料名・量の多言語対応ヘルパー ──────────────────────
        def _ing(names: dict, qty: str) -> dict:
            """材料1行を言語別に生成: 各言語 '・{name}\t{qty}' 形式"""
            return {lang: f"・{names.get(lang, names['ja'])}\t{qty}" for lang in ["ja","en","vi","ne","id","my"]}

        def _sec(titles: dict) -> dict:
            """セクション見出し '【title】' を言語別に生成"""
            return {lang: f"【{titles.get(lang, titles['ja'])}】" for lang in ["ja","en","vi","ne","id","my"]}

        def _build(parts: list[dict]) -> dict:
            """言語別文字列リストを結合して最終記述辞書を作成"""
            result = {lang: "" for lang in ["ja","en","vi","ne","id","my"]}
            for part in parts:
                for lang in result:
                    line = part.get(lang, part.get("ja",""))
                    if result[lang] and line:
                        result[lang] += "\n"
                    result[lang] += line
            return result

        demo_menus = [
            {
                "name": "味噌ラーメン",
                "category": "ラーメン",
                "steps": [
                    (1, "仕込み", _j(_build([
                        _sec({"ja":"材料（スープ）","en":"Ingredients (Soup)","vi":"Nguyên liệu (Nước dùng)","ne":"सामग्री (सुप)","id":"Bahan (Kaldu)","my":"ပါဝင်ပစ္စည်း (ဟင်းချို)"}),
                        _ing({"ja":"水","en":"Water","vi":"Nước","ne":"पानी","id":"Air","my":"ရေ"}, "1.2L"),
                        _ing({"ja":"鶏ガラスープの素","en":"Chicken stock powder","vi":"Bột nước dùng gà","ne":"कुखुराको सुप पाउडर","id":"Kaldu ayam bubuk","my":"ကြက်ဟင်းရည်မှုန့်"}, "小さじ2 / 2 tsp"),
                        _ing({"ja":"昆布だし","en":"Kombu dashi","vi":"Dashi tảo bẹ","ne":"कोम्बु दाशी","id":"Dashi kombu","my":"ကွမ်ဘူဒါရှိ"}, "小さじ1 / 1 tsp"),
                        _ing({"ja":"白味噌","en":"White miso","vi":"Miso trắng","ne":"सेतो मिसो","id":"Miso putih","my":"မြဲမိဆိုဖြူ"}, "大さじ2 / 2 tbsp"),
                        _ing({"ja":"赤味噌","en":"Red miso","vi":"Miso đỏ","ne":"रातो मिसो","id":"Miso merah","my":"မြဲမိဆိုနီ"}, "大さじ1 / 1 tbsp"),
                        _ing({"ja":"みりん","en":"Mirin","vi":"Mirin","ne":"मिरिन","id":"Mirin","my":"မိရင်း"}, "大さじ1 / 1 tbsp"),
                        _ing({"ja":"醤油","en":"Soy sauce","vi":"Nước tương","ne":"सोया सस","id":"Kecap asin","my":"ဆော်ဆ်"}, "小さじ1 / 1 tsp"),
                        _sec({"ja":"具材（1人前）","en":"Toppings (per serving)","vi":"Nguyên liệu (mỗi phần)","ne":"सामग्री (प्रति भाग)","id":"Bahan (per porsi)","my":"ပါဝင်ပစ္စည်း (၁ ဆာဗစ်)"}),
                        _ing({"ja":"チャーシュー","en":"Chashu pork","vi":"Thịt ba chỉ cuộn","ne":"चाशु","id":"Chashu","my":"ချာရှူ"}, "2枚"),
                        _ing({"ja":"メンマ","en":"Bamboo shoots","vi":"Măng","ne":"बाँसको मुना","id":"Rebung","my":"ဝါးကျောင်းမြစ်"}, "30g"),
                        _ing({"ja":"コーン缶","en":"Canned corn","vi":"Ngô đóng hộp","ne":"डिब्बा मकै","id":"Jagung kaleng","my":"ပြောင်းဖူး (ဘူး)"}, "30g"),
                        _ing({"ja":"長ねぎ","en":"Green onion","vi":"Hành lá","ne":"हरियो प्याज","id":"Daun bawang","my":"မြိတ်နက်"}, "ひとつかみ"),
                        _ing({"ja":"無塩バター","en":"Unsalted butter","vi":"Bơ nhạt","ne":"मक्खन","id":"Mentega tawar","my":"ဆားမပါထောပတ်"}, "5g"),
                        _sec({"ja":"スープ準備","en":"Soup Preparation","vi":"Chuẩn bị nước dùng","ne":"सुप तयारी","id":"Persiapan Kaldu","my":"ဟင်းချိုပြင်ဆင်မှု"}),
                        {"ja":"① 寸胴鍋に水1.2Lを入れ強火にかける","en":"① Pour 1.2L water into stockpot and heat on high","vi":"① Cho 1,2L nước vào nồi lớn, đun sôi lửa lớn","ne":"① सुतुली भाँडोमा १.२L पानी राखी ठूलो आँचमा गर्नुहोस्","id":"① Masukkan 1,2L air ke panci besar, panaskan api besar","my":"① အိုးကြီးထဲ ရေ ၁.၂L ထည့်ပြီး မီးကြီးဖြင့် ပူနွေးစေပါ"},
                        {"ja":"② 沸騰したら鶏ガラスープの素・昆布だしを加えよく混ぜる","en":"② When boiling, add chicken stock powder + kombu dashi, mix well","vi":"② Khi sôi, thêm bột nước dùng gà + dashi tảo bẹ, khuấy đều","ne":"② उमालेपछि कुखुराको सुप पाउडर + कोम्बु दाशी थपेर मिसाउनुहोस्","id":"② Setelah mendidih, tambahkan kaldu ayam + dashi kombu, aduk rata","my":"② ကျိုချိုင်လာသောအခါ ကြက်ဟင်းရည်မှုန့် + ကွမ်ဘူဒါရှိ ထည့်ပြီး ဖျော်ပါ"},
                        {"ja":"③ 白味噌・赤味噌・みりん・醤油を加える","en":"③ Add white miso, red miso, mirin, soy sauce","vi":"③ Thêm miso trắng, miso đỏ, mirin, nước tương","ne":"③ सेतो मिसो, रातो मिसो, मिरिन, सोया सस थप्नुहोस्","id":"③ Tambahkan miso putih, miso merah, mirin, kecap asin","my":"③ မြဲမိဆိုဖြူ၊ မြဲမိဆိုနီ၊ မိရင်း၊ ဆော်ဆ် ထည့်ပါ"},
                        {"ja":"④ 弱火にして65〜70℃に保温（沸騰させない）","en":"④ Reduce to low heat, keep at 65–70°C (do not boil)","vi":"④ Giảm lửa nhỏ, giữ 65–70°C (không để sôi)","ne":"④ कम आँचमा ६५–७०°C मा राख्नुहोस् (नउमालिनुस्)","id":"④ Kecilkan api, pertahankan 65–70°C (jangan mendidih)","my":"④ မီးနှေးချပြီး ၆၅–၇၀°C တွင် နွေးနေစေပါ (မကျိုနဲ့)"},
                        {"ja":"⑤ 味見して塩気を調整（薄ければ味噌追加・濃ければ水）","en":"⑤ Taste and adjust — add miso if bland, water if too salty","vi":"⑤ Nếm thử và điều chỉnh — thêm miso nếu nhạt, thêm nước nếu mặn","ne":"⑤ स्वाद चाखेर मिलाउनुहोस्: फिका भए मिसो, नुनिलो भए पानी","id":"⑤ Cicipi dan sesuaikan — tambah miso jika kurang asin, air jika terlalu asin","my":"⑤ မြည်းကြည့်ပြီး ညှိပါ — ပျော့လျှင် မြဲမိဆိုပိုထည့်ပါ၊ ဆားများလျှင် ရေထည့်ပါ"},
                        _sec({"ja":"具材仕込み","en":"Ingredient Prep","vi":"Chuẩn bị nguyên liệu","ne":"सामग्री तयारी","id":"Persiapan Bahan","my":"ပါဝင်ပစ္စည်းပြင်ဆင်မှု"}),
                        {"ja":"⑥ チャーシューを5mm厚にスライス（1人前2枚）","en":"⑥ Slice chashu 5mm thick, 2 slices per serving","vi":"⑥ Thái chashu dày 5mm, 2 miếng mỗi phần","ne":"⑥ चाशु ५mm मोटोमा काट्नुहोस् (१ भाग = २ टुक्रा)","id":"⑥ Iris chashu setebal 5mm, 2 potong per porsi","my":"⑥ ချာရှူကို ၅mm ထူအောင် ဖြတ်ပါ (၁ ဆာဗစ် = ၂ ချပ်)"},
                        {"ja":"⑦ メンマはザルで水切り、1人前30gを小皿に盛る","en":"⑦ Drain bamboo shoots, 30g per serving in a small dish","vi":"⑦ Để ráo măng, 30g mỗi phần vào đĩa nhỏ","ne":"⑦ बाँसको मुना पानी निकालेर प्रति भाग ३०g सानो प्लेटमा","id":"⑦ Tiriskan rebung, siapkan 30g per porsi di piring kecil","my":"⑦ ဝါးကျောင်းမြစ်ကို စစ်ပြီး ၁ ဆာဗစ်လျှင် ၃၀g ပန်းကန်ငယ်ထဲ"},
                        {"ja":"⑧ コーン缶の水切り、1人前30gを小皿に用意","en":"⑧ Drain canned corn, 30g per serving in a small dish","vi":"⑧ Để ráo ngô đóng hộp, 30g mỗi phần","ne":"⑧ डिब्बा मकैको पानी निकालेर प्रति भाग ३०g","id":"⑧ Tiriskan jagung kaleng, siapkan 30g per porsi","my":"⑧ ပြောင်းဖူးဘူးကို စစ်ပြီး ၁ ဆာဗစ်လျှင် ၃၀g"},
                        {"ja":"⑨ 長ねぎを斜め薄切り、1人前ひとつかみを用意","en":"⑨ Slice green onion diagonally thin, a handful per serving","vi":"⑨ Thái hành lá xiên mỏng, một nắm mỗi phần","ne":"⑨ हरियो प्याज तेर्सो पातलो काट्नुहोस्, प्रति भाग एक मुठी","id":"⑨ Iris tipis daun bawang serong, segenggam per porsi","my":"⑨ မြိတ်နက်ကို ထောင်ဖြတ်ပြီး ၁ ဆာဗစ်လျှင် တစ်ဆုပ်"},
                        {"ja":"⑩ バター5gをラップで小分け、冷蔵庫から出しておく","en":"⑩ Wrap 5g butter per serving in plastic, take out of fridge before service","vi":"⑩ Chia 5g bơ mỗi phần, bọc màng thực phẩm, lấy ra khỏi tủ lạnh trước khi phục vụ","ne":"⑩ प्रति भाग ५g मक्खन ल्यापमा बेरेर सेवा अगाडि फ्रिजबाट निकाल्नुहोस्","id":"⑩ Bungkus 5g mentega per porsi, keluarkan dari kulkas sebelum saji","my":"⑩ ဆားမပါထောပတ် ၅g ကို ဖြောင်မြူတွင် ထုပ်ပြီး ဝန်ဆောင်မှုမတိုင်မီ ရေခဲသေတ္တာမှ ထုတ်ပါ"},
                    ]))),
                    (2, "調理", _j(_build([
                        _sec({"ja":"材料（1人前）","en":"Ingredients (1 serving)","vi":"Nguyên liệu (1 phần)","ne":"सामग्री (१ भाग)","id":"Bahan (1 porsi)","my":"ပါဝင်ပစ္စည်း (၁ ဆာဗစ်)"}),
                        _ing({"ja":"中太麺","en":"Medium-thick noodles","vi":"Mì trung bình","ne":"मध्यम मोटो चाउचाउ","id":"Mie tebal sedang","my":"ခေါက်ဆွဲ (အလတ်)"}, "1玉"),
                        _ing({"ja":"仕込みスープ","en":"Prepared miso soup","vi":"Nước dùng đã chuẩn bị","ne":"तयार सुप","id":"Kaldu yang disiapkan","my":"ကြိုတင်ဟင်းချို"}, "250ml"),
                        _ing({"ja":"鶏油（あれば）","en":"Chicken oil (optional)","vi":"Dầu gà (tuỳ chọn)","ne":"कुखुराको तेल (ऐच्छिक)","id":"Minyak ayam (opsional)","my":"ကြက်ဆီ (ရွေးချယ်နိုင်)"}, "小さじ1/2"),
                        _sec({"ja":"麺の茹で方","en":"How to Boil Noodles","vi":"Cách luộc mì","ne":"चाउचाउ उमाल्ने तरिका","id":"Cara Merebus Mie","my":"ခေါက်ဆွဲပြုတ်နည်း"}),
                        {"ja":"① 大鍋に湯を沸騰させる（麺1玉につき最低1L）","en":"① Boil a large pot of water (at least 1L per serving)","vi":"① Đun sôi nồi nước lớn (tối thiểu 1L mỗi khẩu phần)","ne":"① ठूलो भाँडोमा पानी उमाल्नुहोस् (कम्तिमा १L)","id":"① Didihkan air dalam panci besar (minimal 1L per porsi)","my":"① ကြီးသောအိုးတွင် ရေကျိုပါ (တစ်ဆာဗစ်လျှင် အနည်းဆုံး ၁L)"},
                        {"ja":"② 麺1玉をほぐしながら投入、箸でやさしくほぐす","en":"② Drop in 1 serving of noodles, gently loosen with chopsticks","vi":"② Thả 1 khẩu phần mì, nhẹ nhàng tách bằng đũa","ne":"② १ भागको चाउचाउ भुसाउँदै हाल्नुहोस्","id":"② Masukkan 1 porsi mie, urai perlahan dengan sumpit","my":"② ၁ ဆာဗစ် ခေါက်ဆွဲကို ဖြောင်ကာ ထည့်ပါ"},
                        {"ja":"③ 中太麺は2分ちょうどで引き上げる（茹ですぎ注意）","en":"③ Medium-thick noodles: exactly 2 min — do not overcook","vi":"③ Mì trung bình: đúng 2 phút — không luộc quá","ne":"③ मध्यम मोटो: ठ्याक्कै २ मिनेट (धेरै नउमाल्नुस्)","id":"③ Mie tebal sedang: tepat 2 menit — jangan terlalu lama","my":"③ အလတ်ကြိမ်မျောက်: ၂ မိနစ်တိတိ — မချေးပစ်နဲ့"},
                        {"ja":"④ ザルに上げ15秒しっかり湯切りする","en":"④ Drain in colander for 15 seconds firmly","vi":"④ Để ráo trong rổ 15 giây","ne":"④ कोलान्दरमा १५ सेकेन्ड राम्रोसँग पानी निकाल्नुहोस्","id":"④ Tiriskan dalam colander 15 detik dengan kuat","my":"④ စစ်ပြားတွင် ၁၅ စက္ကန့် ရေကောင်းကောင်းစင်ပါ"},
                        _sec({"ja":"スープ・丼の準備","en":"Soup & Bowl Prep","vi":"Chuẩn bị nước dùng & bát","ne":"सुप र कचौरा तयारी","id":"Persiapan Kaldu & Mangkuk","my":"ဟင်းချိုနှင့် ဖလားပြင်ဆင်မှု"}),
                        {"ja":"⑤ 丼に熱湯を注いで30秒温め、お湯を捨てて水気を拭く","en":"⑤ Fill bowl with hot water 30 sec to warm, discard and wipe dry","vi":"⑤ Đổ nước nóng vào bát 30 giây để hâm, đổ đi và lau khô","ne":"⑤ कचौरामा तातो पानी ३० सेकेन्ड राखी तातो पार्नुहोस्, फाल्नुहोस्","id":"⑤ Isi mangkuk dengan air panas 30 detik, buang dan lap kering","my":"⑤ ဖလားထဲ ရေနွေးထည့်ပြီး ၃၀ စက္ကန့် နွေးပြီး ရေဖြုတ်ကာ သုတ်ပါ"},
                        {"ja":"⑥ 保温スープを玉杓子2〜3杯（約250ml）丼に注ぐ","en":"⑥ Ladle 2–3 scoops (approx. 250ml) of warm soup into bowl","vi":"⑥ Múc 2–3 muôi (khoảng 250ml) nước dùng vào bát","ne":"⑥ सुप २–३ करछी (करिब २५०ml) कचौरामा हाल्नुहोस्","id":"⑥ Tuang 2–3 sendok ladel (sekitar 250ml) kaldu hangat ke mangkuk","my":"⑥ ကျိုထားသောဟင်းချိုကို တဆပ် ၂–၃ ဇွန်း (ဝန်ထမ်ကိုပ်ဆိုလျှင် ၂၅၀ml) ထည့်ပါ"},
                        {"ja":"⑦ スープ表面の油膜を確認（なければ鶏油 小さじ1/2）","en":"⑦ Check for oil film on surface (if none, add ½ tsp chicken oil)","vi":"⑦ Kiểm tra lớp dầu trên bề mặt (nếu không có, thêm ½ muỗng dầu gà)","ne":"⑦ सतहमा तेलको तह छ कि छैन जाँच्नुहोस् (नभए कुखुराको तेल ½ चम्चा)","id":"⑦ Periksa lapisan minyak di permukaan (jika tidak ada, tambahkan ½ sdt minyak ayam)","my":"⑦ မျက်နှာပြင်ပေါ် ဆီမြှင်းရှိမရှိ စစ်ဆေးပါ (မရှိပါက ကြက်ဆီ ½ ဇွန်းထည့်ပါ)"},
                        {"ja":"⑧ 湯切りした麺を丼に入れ、菜箸でスープに馴染ませる","en":"⑧ Add drained noodles, gently press with chopsticks to blend into soup","vi":"⑧ Cho mì đã ráo vào, nhẹ nhàng nhấn bằng đũa cho quyện vào nước dùng","ne":"⑧ पानी निकालेको चाउचाउ हाल्नुहोस् र सुपमा मिसिने गरी थिच्नुहोस्","id":"⑧ Masukkan mie yang sudah ditiriskan, tekan perlahan agar menyatu dengan kaldu","my":"⑧ ရေဖြောသောခေါက်ဆွဲကို ထည့်ပြီး ဟင်းချိုနှင့် ညှိကာ ဖိပါ"},
                    ]))),
                    (3, "盛付", _j(_build([
                        _sec({"ja":"トッピング（1人前）","en":"Toppings (1 serving)","vi":"Topping (1 phần)","ne":"टपिङ (१ भाग)","id":"Topping (1 porsi)","my":"ထောပတ်ဆောင်ကျောင်း (၁ ဆာဗစ်)"}),
                        _ing({"ja":"チャーシュー","en":"Chashu pork","vi":"Thịt ba chỉ cuộn","ne":"चाशु","id":"Chashu","my":"ချာရှူ"}, "2枚"),
                        _ing({"ja":"メンマ","en":"Bamboo shoots","vi":"Măng","ne":"बाँसको मुना","id":"Rebung","my":"ဝါးကျောင်းမြစ်"}, "30g"),
                        _ing({"ja":"コーン","en":"Corn","vi":"Ngô","ne":"मकै","id":"Jagung","my":"ပြောင်းဖူး"}, "30g"),
                        _ing({"ja":"刻みねぎ","en":"Chopped green onion","vi":"Hành lá thái nhỏ","ne":"कटेको हरियो प्याज","id":"Daun bawang cincang","my":"ညှပ်ထားသောမြိတ်နက်"}, "ひとつかみ"),
                        _ing({"ja":"バター","en":"Butter","vi":"Bơ","ne":"मक्खन","id":"Mentega","my":"ထောပတ်"}, "5g"),
                        _ing({"ja":"白ごま","en":"White sesame","vi":"Mè trắng","ne":"सेतो तिल","id":"Wijen putih","my":"ဖြူသောနှမ်း"}, "少々"),
                        _sec({"ja":"盛り付け手順","en":"Plating Steps","vi":"Các bước trình bày","ne":"सजावट चरणहरू","id":"Langkah Plating","my":"ပန်းကန်ထည့်မှုအဆင့်များ"}),
                        {"ja":"① 麺が丼の中央にこんもり盛れているか確認し形を整える","en":"① Confirm noodles are mounded in the center; shape neatly","vi":"① Kiểm tra mì đã vun vào giữa bát, chỉnh hình dạng","ne":"① चाउचाउ कचौराको बीचमा थुप्रिएको छ कि छैन जाँच्नुहोस्","id":"① Pastikan mie menumpuk di tengah mangkuk, atur bentuknya","my":"① ခေါက်ဆွဲသည် ဖလားအလည်တွင် ပုံနေမနေ စစ်ဆေးပြီး ပုံသဏ္ဍာန် ပြင်ပါ"},
                        {"ja":"② チャーシュー2枚を手前側に扇形に重ねて並べる","en":"② Place 2 chashu slices in a fan shape overlapping at the front","vi":"② Xếp 2 miếng chashu dạng quạt chồng lên nhau ở phía trước","ne":"② कचौराको अगाडि चाशु २ टुक्रा फ्यान आकारमा राख्नुहोस्","id":"② Susun 2 potong chashu berbentuk kipas bertumpang di bagian depan","my":"② ချာရှူ ၂ ချပ်ကို ဖလားရှေ့တွင် ပန်ကာပုံ ထပ်၍ စီပါ"},
                        {"ja":"③ メンマ30gをチャーシューの隣（右側）に立てかけて盛る","en":"③ Stand bamboo shoots (30g) next to chashu on the right","vi":"③ Dựng 30g măng bên cạnh chashu (bên phải)","ne":"③ बाँसको मुना ३०g चाशुको दायाँ छेउमा राख्नुहोस्","id":"③ Sandarkan 30g rebung di samping chashu (sisi kanan)","my":"③ ဝါးကျောင်းမြစ် ၃၀g ကို ချာရှူဘေး (ညာဘက်) တွင် မှီ၍ ထည့်ပါ"},
                        {"ja":"④ コーン30gを左側にこんもりと盛る","en":"④ Mound corn (30g) on the left side","vi":"④ Vun 30g ngô ở bên trái","ne":"④ मकै ३०g बायाँतर्फ थुपार्नुहोस्","id":"④ Tumpuk 30g jagung di sisi kiri","my":"④ ပြောင်းဖူး ၃၀g ကို ဘယ်ဘက်တွင် ပုံပါ"},
                        {"ja":"⑤ 刻みねぎをひとつかみ、丼の中央やや奥に山になるよう盛る","en":"⑤ Place chopped green onion in a mound toward the back center","vi":"⑤ Đặt một đống hành lá ở giữa phần sau bát","ne":"⑤ कटेको हरियो प्याज एक मुठी पछाडि बीचमा थुपार्नुहोस्","id":"⑤ Letakkan tumpukan daun bawang di bagian tengah belakang","my":"⑤ ညှပ်ထားသောမြိတ်နက်ကို ဖလားအလည်နောက်ဘက်တွင် ပုံပါ"},
                        {"ja":"⑥ バター5gをねぎの頂点に乗せる（提供直前に乗せること）","en":"⑥ Place 5g butter on top of green onion (add just before serving)","vi":"⑥ Đặt 5g bơ lên trên hành lá (chỉ đặt ngay trước khi phục vụ)","ne":"⑥ मक्खन ५g हरियो प्याजको माथि राख्नुहोस् (परिवेशन अगावै मात्र)","id":"⑥ Letakkan 5g mentega di atas daun bawang (tambahkan sesaat sebelum saji)","my":"⑥ ထောပတ် ၅g ကို မြိတ်နက်ထိပ်တွင် တင်ပါ (ဝန်ဆောင်မှုမတိုင်မီသာ)"},
                        {"ja":"⑦ 白ごまをひとつまみ全体に振りかける","en":"⑦ Sprinkle a pinch of white sesame over everything","vi":"⑦ Rắc một nhúm mè trắng lên toàn bộ","ne":"⑦ सेतो तिल एक चिम्टी सबैतिर छर्नुहोस्","id":"⑦ Taburi sejumput wijen putih di seluruh permukaan","my":"⑦ ဖြူသောနှမ်းကို တစ်ဆုပ် ဖြန်ပါ"},
                        {"ja":"⑧ 丼のフチを布巾で拭き、テーブル番号を確認してから提供","en":"⑧ Wipe bowl rim with cloth, confirm table number before serving","vi":"⑧ Lau vành bát bằng khăn, xác nhận số bàn trước khi mang ra","ne":"⑧ कचौराको किनारा पुछ्नुहोस्, टेबल नम्बर जाँचेर परिवेशन गर्नुहोस्","id":"⑧ Lap tepi mangkuk, konfirmasi nomor meja sebelum menyajikan","my":"⑧ ဖလားနားစကို သုတ်ပြီး စားပွဲနံပါတ် အတည်ပြုကာ ဝန်ဆောင်ပါ"},
                    ]))),
                ],
            },
            {
                "name": "醤油ラーメン",
                "category": "ラーメン",
                "steps": [
                    (1, "仕込み", _j(_build([
                        _sec({"ja":"材料（1人前）","en":"Ingredients (1 serving)","vi":"Nguyên liệu (1 phần)","ne":"सामग्री (१ भाग)","id":"Bahan (1 porsi)","my":"ပါဝင်ပစ္စည်း (၁ ဆာဗစ်)"}),
                        _ing({"ja":"鶏ガラスープ","en":"Chicken stock","vi":"Nước dùng gà","ne":"कुखुराको सुप","id":"Kaldu ayam","my":"ကြက်ဟင်းရည်"}, "1.2L"),
                        _ing({"ja":"醤油ダレ","en":"Soy sauce tare","vi":"Nước tương tare","ne":"सोया सस ताने","id":"Soy sauce tare","my":"ဆော်ဆ်တာရဲ"}, "大さじ2"),
                        _ing({"ja":"みりん","en":"Mirin","vi":"Mirin","ne":"मिरिन","id":"Mirin","my":"မိရင်း"}, "小さじ1"),
                        _ing({"ja":"チャーシュー","en":"Chashu pork","vi":"Chashu","ne":"चाशु","id":"Chashu","my":"ချာရှူ"}, "2枚"),
                        _ing({"ja":"ナルト","en":"Narutomaki","vi":"Narutomaki","ne":"नारुतो","id":"Narutomaki","my":"နားရုတောမာကိ"}, "1枚"),
                        _ing({"ja":"海苔","en":"Nori seaweed","vi":"Rong biển","ne":"नोरी","id":"Nori","my":"ဆီဖတ်ပင်"}, "1枚"),
                        _ing({"ja":"刻みネギ","en":"Chopped green onion","vi":"Hành lá thái nhỏ","ne":"कटेको हरियो प्याज","id":"Daun bawang cincang","my":"ညှပ်ထားသောမြိတ်နက်"}, "適量"),
                        _sec({"ja":"手順","en":"Steps","vi":"Các bước","ne":"चरणहरू","id":"Langkah","my":"အဆင့်များ"}),
                        {"ja":"① 鍋に鶏ガラスープ1.2Lを入れ沸騰させる","en":"① Bring 1.2L chicken stock to a boil","vi":"① Đun sôi 1,2L nước dùng gà","ne":"① भाँडोमा कुखुराको सुप १.२L उमाल्नुहोस्","id":"① Didihkan 1,2L kaldu ayam","my":"① ကြက်ဟင်းရည် ၁.၂L ကို ကျိုပါ"},
                        {"ja":"② 醤油ダレ・みりんを加えて混ぜ、弱火で70℃に保温","en":"② Add soy sauce tare + mirin, mix. Keep at 70°C on low heat","vi":"② Thêm nước tương tare + mirin, khuấy. Giữ ấm 70°C lửa nhỏ","ne":"② सोया सस ताने + मिरिन थपेर मिसाउनुहोस्। कम आँचमा ७०°C","id":"② Tambahkan soy sauce tare + mirin, aduk. Jaga hangat 70°C api kecil","my":"② ဆော်ဆ်တာရဲ + မိရင်း ထည့်ပြီး ဖျော်ပါ။ ၇၀°C မီးနှေးဖြင့် နွေးနေစေပါ"},
                        {"ja":"③ チャーシューを5mm厚にスライス（1人前2枚）","en":"③ Slice chashu 5mm thick (2 slices per serving)","vi":"③ Thái chashu 5mm (2 miếng mỗi phần)","ne":"③ चाशु ५mm मोटोमा काट्नुहोस् (१ भाग = २ टुक्रा)","id":"③ Iris chashu 5mm (2 potong per porsi)","my":"③ ချာရှူကို ၅mm ဖြတ်ပါ (၁ ဆာဗစ် = ၂ ချပ်)"},
                        {"ja":"④ ナルト・海苔・刻みネギを用意する","en":"④ Prepare narutomaki, nori, and chopped green onion","vi":"④ Chuẩn bị narutomaki, rong biển và hành lá","ne":"④ नारुतो, नोरी, हरियो प्याज तयार गर्नुहोस्","id":"④ Siapkan narutomaki, nori, dan daun bawang","my":"④ နားရုတောမာကိ၊ ဆီဖတ်ပင်နှင့် မြိတ်နက်ပြင်ဆင်ပါ"},
                    ]))),
                    (2, "調理", _j(_build([
                        _sec({"ja":"材料（1人前）","en":"Ingredients (1 serving)","vi":"Nguyên liệu (1 phần)","ne":"सामग्री (१ भाग)","id":"Bahan (1 porsi)","my":"ပါဝင်ပစ္စည်း (၁ ဆာဗစ်)"}),
                        _ing({"ja":"細麺","en":"Thin noodles","vi":"Mì mảnh","ne":"पातलो चाउचाउ","id":"Mie tipis","my":"ပါးသောခေါက်ဆွဲ"}, "1玉"),
                        _ing({"ja":"醤油スープ","en":"Soy soup","vi":"Nước dùng tương","ne":"सोया सुप","id":"Kaldu kecap","my":"ဆော်ဆ်ဟင်းချို"}, "250ml"),
                        _sec({"ja":"手順","en":"Steps","vi":"Các bước","ne":"चरणहरू","id":"Langkah","my":"အဆင့်များ"}),
                        {"ja":"① 湯を沸騰させ細麺1玉を1分30秒茹でる","en":"① Boil water, cook thin noodles for 1 min 30 sec","vi":"① Đun sôi nước và luộc mì mảnh 1 phút 30 giây","ne":"① पानी उमालेर पातलो चाउचाउ १ मिनेट ३० सेकेन्ड उमाल्नुहोस्","id":"① Didihkan air, rebus mie tipis 1 menit 30 detik","my":"① ရေကျိုပြီး ပါးသောခေါက်ဆွဲကို ၁ မိနစ် ၃၀ စက္ကန့် ပြုတ်ပါ"},
                        {"ja":"② 丼を温め、スープ250mlを注ぐ","en":"② Warm the bowl, ladle in 250ml soup","vi":"② Hâm nóng bát, múc 250ml nước dùng vào","ne":"② कचौरा तातो पार्नुहोस्, सुप २५०ml हाल्नुहोस्","id":"② Hangatkan mangkuk, tuangkan 250ml kaldu","my":"② ဖလားနွေးပြီး ဟင်းချို ၂၅၀ml ထည့်ပါ"},
                        {"ja":"③ よく湯切りした麺を丼に盛る","en":"③ Drain noodles well and place in bowl","vi":"③ Để ráo mì và đặt vào bát","ne":"③ राम्ररी पानी निकालेको चाउचाउ राख्नुहोस्","id":"③ Tiriskan mie dengan baik dan masukkan ke mangkuk","my":"③ ရေကောင်းကောင်းစစ်ပြီး ခေါက်ဆွဲတင်ပါ"},
                    ]))),
                    (3, "盛付", _j(_build([
                        _sec({"ja":"手順","en":"Plating Steps","vi":"Các bước trình bày","ne":"सजावट चरणहरू","id":"Langkah Plating","my":"ပန်းကန်ထည့်မှုအဆင့်များ"}),
                        {"ja":"① チャーシュー2枚を並べる","en":"① Arrange 2 chashu slices","vi":"① Xếp 2 miếng chashu","ne":"① चाशु २ टुक्रा राख्नुहोस्","id":"① Susun 2 potong chashu","my":"① ချာရှူ ၂ ချပ် စီပါ"},
                        {"ja":"② 海苔1枚を立てかける","en":"② Stand 1 sheet of nori against the bowl","vi":"② Dựng 1 tờ rong biển vào bát","ne":"② नोरी १ टुक्रा अड्याउनुहोस्","id":"② Sandarkan 1 lembar nori","my":"② ဆီဖတ်ပင် ၁ ချပ် မှီ၍ တင်ပါ"},
                        {"ja":"③ ナルト1枚・刻みネギを添えて完成","en":"③ Add narutomaki and chopped green onion to finish","vi":"③ Thêm narutomaki và hành lá thái nhỏ là xong","ne":"③ नारुतो र हरियो प्याज राखेर सक्नुहोस्","id":"③ Tambahkan narutomaki dan daun bawang cincang, selesai","my":"③ နားရုတောမာကိနှင့် မြိတ်နက်ထည့်ပြီး ပြီးဆုံးသည်"},
                    ]))),
                ],
            },
            {
                "name": "餃子(5個)",
                "category": "サイドメニュー",
                "steps": [
                    (1, "仕込み", _j(_build([
                        _sec({"ja":"材料","en":"Ingredients","vi":"Nguyên liệu","ne":"सामग्री","id":"Bahan","my":"ပါဝင်ပစ္စည်း"}),
                        _ing({"ja":"冷凍餃子","en":"Frozen gyoza","vi":"Gyoza đông lạnh","ne":"फ्रोजन ग्योजा","id":"Gyoza beku","my":"အေးခဲဂျိုဇာ"}, "5個"),
                        _ing({"ja":"サラダ油","en":"Salad oil","vi":"Dầu ăn","ne":"सलाड तेल","id":"Minyak salad","my":"ဆလတ်ဆီ"}, "小さじ1"),
                        _sec({"ja":"手順","en":"Steps","vi":"Các bước","ne":"चरणहरू","id":"Langkah","my":"အဆင့်များ"}),
                        {"ja":"① 冷凍餃子5個を冷凍庫から出す","en":"① Take 5 frozen gyoza out of the freezer","vi":"① Lấy 5 gyoza đông lạnh ra khỏi tủ đông","ne":"① फ्रिजरबाट ५ वटा फ्रोजन ग्योजा निकाल्नुहोस्","id":"① Keluarkan 5 gyoza beku dari freezer","my":"① ရေခဲသေတ္တာမှ ဂျိုဇာ အေးခဲ ၅ ခု ထုတ်ပါ"},
                        {"ja":"② フライパンにサラダ油小さじ1を引く","en":"② Coat a frying pan with 1 tsp salad oil","vi":"② Phủ 1 muỗng cà phê dầu ăn lên chảo","ne":"② फ्राइप्यानमा सलाड तेल १ चम्चा लगाउनुहोस्","id":"② Olesi wajan dengan 1 sdt minyak salad","my":"② ကြော်အိုးကို ဆီ ၁ ဇွန်း ကြိုးပါ"},
                    ]))),
                    (2, "調理", _j(_build([
                        _sec({"ja":"手順","en":"Steps","vi":"Các bước","ne":"चरणहरू","id":"Langkah","my":"အဆင့်များ"}),
                        {"ja":"① 中火でフライパンを温め餃子を並べる","en":"① Heat pan on medium heat, arrange gyoza","vi":"① Làm nóng chảo ở lửa vừa, xếp gyoza vào","ne":"① मध्यम आँचमा फ्राइप्यान गर्म गर्नुहोस्, ग्योजा राख्नुहोस्","id":"① Panaskan wajan di api sedang, tata gyoza","my":"① မီးအလတ်ဖြင့် ကြော်အိုးနွေးပြီး ဂျိုဇာ စီပါ"},
                        {"ja":"② 底面がきつね色になるまで2分焼く","en":"② Fry for 2 min until golden brown on bottom","vi":"② Chiên 2 phút cho đến khi mặt dưới vàng đều","ne":"② तलको भाग सुनौलो नहुँदासम्म २ मिनेट तल्नुहोस्","id":"② Goreng 2 menit hingga bagian bawah kecokelatan","my":"② အောက်ခြေ ရွှေဝါရောင်ဖြစ်ရန် ၂ မိနစ် ကြော်ပါ"},
                        {"ja":"③ 水50mlを回し入れ蓋をして蒸し焼き2分","en":"③ Pour in 50ml water, cover and steam-fry 2 min","vi":"③ Đổ 50ml nước, đậy nắp và hấp 2 phút","ne":"③ ५०ml पानी राखेर ढक्कन लगाई २ मिनेट भाप पकाउनुहोस्","id":"③ Tuang 50ml air, tutup dan kukus-goreng 2 menit","my":"③ ရေ ၅၀ml ဝန်းကျင်ထည့်ပြီး အဖုံးဖြင့် ၂ မိနစ် ပေါင်းပါ"},
                        {"ja":"④ 蓋を外し水分を飛ばしパリッとさせる","en":"④ Remove lid, evaporate water until crispy","vi":"④ Mở nắp, để bay hơi nước cho giòn","ne":"④ ढक्कन हटाएर पानी उड्न दिनुहोस्","id":"④ Buka tutup, uapkan air hingga renyah","my":"④ အဖုံးဖွင့်ကာ ရေငွေ့ပျံပြီး ကြောင်ကောင်ဖြစ်အောင် ကြော်ပါ"},
                    ]))),
                    (3, "盛付", _j(_build([
                        _sec({"ja":"手順","en":"Steps","vi":"Các bước","ne":"चरणहरू","id":"Langkah","my":"အဆင့်များ"}),
                        {"ja":"① 丸皿に餃子5個をきれいに並べる","en":"① Arrange 5 gyoza neatly on a round plate","vi":"① Xếp 5 gyoza gọn gàng trên đĩa tròn","ne":"① गोलो थालमा ५ वटा ग्योजा सुन्दर तरिकाले राख्नुहोस्","id":"① Tata 5 gyoza dengan rapi di piring bundar","my":"① ဝိုင်းသောပန်းကန်တွင် ဂျိုဇာ ၅ ခု သပ်ရပ်စွာ စီပါ"},
                        {"ja":"② タレ（醤油・酢・ラー油）を小皿に添える","en":"② Serve dipping sauce (soy, vinegar, chili oil) in a small dish","vi":"② Kèm nước chấm (nước tương, giấm, dầu ớt) trong đĩa nhỏ","ne":"② डिपिङ सस (सोया, सिरका, चिली तेल) सानो थालमा राख्नुहोस्","id":"② Sertakan saus celup (kecap, cuka, minyak cabai) di piring kecil","my":"② ဆော်ဆ် (ဆော်ဆ်ဆ်အိုင်၊ ရှာလကာ၊ ငရုတ်ဆီ) ပန်းကန်ငယ်တွင် ထည့်ပါ"},
                        {"ja":"③ 仕上げにパセリを少量散らす","en":"③ Garnish with a small amount of parsley","vi":"③ Trang trí với một ít mùi tây","ne":"③ थोरै पार्सले छर्नुहोस्","id":"③ Taburi sedikit parsley untuk hiasan","my":"③ ပါဆ်လေ အနည်းငယ် ဖြန်ပါ"},
                    ]))),
                ],
            },
            {
                "name": "チャーシュー丼",
                "category": "ご飯もの",
                "steps": [
                    (1, "仕込み", _j(_build([
                        _sec({"ja":"材料（1人前）","en":"Ingredients (1 serving)","vi":"Nguyên liệu (1 phần)","ne":"सामग्री (१ भाग)","id":"Bahan (1 porsi)","my":"ပါဝင်ပစ္စည်း (၁ ဆာဗစ်)"}),
                        _ing({"ja":"チャーシュー","en":"Chashu pork","vi":"Thịt ba chỉ cuộn","ne":"चाशु","id":"Chashu","my":"ချာရှူ"}, "3枚"),
                        _ing({"ja":"タレ（醤油）","en":"Tare (soy sauce)","vi":"Sốt tare (nước tương)","ne":"ताने (सोया सस)","id":"Tare (kecap asin)","my":"တာရဲ (ဆော်ဆ်)"}, "大さじ1"),
                        _ing({"ja":"タレ（みりん）","en":"Tare (mirin)","vi":"Sốt tare (mirin)","ne":"ताने (मिरिन)","id":"Tare (mirin)","my":"တာရဲ (မိရင်း)"}, "大さじ1"),
                        _ing({"ja":"タレ（砂糖）","en":"Tare (sugar)","vi":"Sốt tare (đường)","ne":"ताने (चिनी)","id":"Tare (gula)","my":"တာရဲ (သကြားလောင်း)"}, "小さじ1"),
                        _ing({"ja":"温泉卵","en":"Onsen egg","vi":"Trứng onsen","ne":"ओन्सेन अण्डा","id":"Telur onsen","my":"ဥနွေး"}, "1個"),
                        _sec({"ja":"手順","en":"Steps","vi":"Các bước","ne":"चरणहरू","id":"Langkah","my":"အဆင့်များ"}),
                        {"ja":"① チャーシューを5mm厚にスライス（1人前3枚）","en":"① Slice chashu 5mm thick (3 slices per serving)","vi":"① Thái chashu 5mm (3 miếng mỗi phần)","ne":"① चाशु ५mm मोटोमा काट्नुहोस् (१ भाग = ३ टुक्रा)","id":"① Iris chashu 5mm (3 potong per porsi)","my":"① ချာရှူကို ၅mm ဖြတ်ပါ (၁ ဆာဗစ် = ၃ ချပ်)"},
                        {"ja":"② タレを小鍋で軽く煮詰める","en":"② Simmer tare sauce in a small pot until slightly thickened","vi":"② Đun nhẹ sốt tare trong nồi nhỏ cho đến khi hơi đặc","ne":"② ताने सस सानो भाँडोमा हल्का उमाल्नुहोस्","id":"② Rebus saus tare dalam panci kecil hingga sedikit mengental","my":"② တာရဲဆော်ဆ်ကို အိုးငယ်တွင် အနည်းငယ် ကျိုပါ"},
                        {"ja":"③ 温泉卵を湯煎で準備（68℃・12分）","en":"③ Prepare onsen egg sous vide (68°C, 12 min)","vi":"③ Chuẩn bị trứng onsen bằng hầm cách thủy (68°C, 12 phút)","ne":"③ ओन्सेन अण्डा (६८°C · १२ मिनेट) तयार गर्नुहोस्","id":"③ Siapkan telur onsen bain-marie (68°C, 12 menit)","my":"③ ဥနွေးကို ၆၈°C · ၁၂ မိနစ် ရေနွေးဖြင့် ပြင်ဆင်ပါ"},
                    ]))),
                    (2, "調理", _j(_build([
                        _sec({"ja":"材料（1人前）","en":"Ingredients (1 serving)","vi":"Nguyên liệu (1 phần)","ne":"सामग्री (१ भाग)","id":"Bahan (1 porsi)","my":"ပါဝင်ပစ္စည်း (၁ ဆာဗစ်)"}),
                        _ing({"ja":"ご飯","en":"Cooked rice","vi":"Cơm","ne":"भात","id":"Nasi","my":"ထမင်း"}, "200g"),
                        _ing({"ja":"チャーシュー（スライス済み）","en":"Sliced chashu","vi":"Chashu đã thái","ne":"काटिएको चाशु","id":"Chashu yang sudah diiris","my":"ဖြတ်ပြီးချာရှူ"}, "3枚"),
                        _ing({"ja":"タレ","en":"Tare sauce","vi":"Sốt tare","ne":"ताने सस","id":"Saus tare","my":"တာရဲဆော်ဆ်"}, "スプーン2杯"),
                        _sec({"ja":"手順","en":"Steps","vi":"Các bước","ne":"चरणहरू","id":"Langkah","my":"အဆင့်များ"}),
                        {"ja":"① ご飯200gを茶碗型に丼へ盛る","en":"① Mound 200g rice in a neat dome into bowl","vi":"① Đơm 200g cơm vào bát theo hình vòm gọn","ne":"① कचौरामा चामल २००g थालको आकारमा राख्नुहोस्","id":"① Tuang 200g nasi ke mangkuk dalam bentuk kubah","my":"① ထမင်း ၂၀၀g ကို ဖလားတွင် ပုံ့ပုံ့ပုံပါ"},
                        {"ja":"② チャーシュー3枚を扇形に並べる","en":"② Arrange 3 chashu slices in a fan shape","vi":"② Xếp 3 miếng chashu theo hình quạt","ne":"② चाशु ३ टुक्रा फ्यान आकारमा राख्नुहोस्","id":"② Susun 3 potong chashu berbentuk kipas","my":"② ချာရှူ ၃ ချပ်ကို ပန်ကာပုံ စီပါ"},
                        {"ja":"③ タレをスプーン2杯かける","en":"③ Drizzle 2 spoonfuls of tare sauce over","vi":"③ Rưới 2 thìa sốt tare lên trên","ne":"③ ताने सस २ चम्चा माथिबाट राख्नुहोस्","id":"③ Siramkan 2 sendok saus tare","my":"③ တာရဲဆော်ဆ် ၂ ဇွန်း ဖြန်ပါ"},
                    ]))),
                    (3, "盛付", _j(_build([
                        _sec({"ja":"手順","en":"Plating Steps","vi":"Các bước trình bày","ne":"सजावट चरणहरू","id":"Langkah Plating","my":"ပန်းကန်ထည့်မှုအဆင့်များ"}),
                        {"ja":"① 中央に温泉卵を1個乗せる","en":"① Place 1 onsen egg in the center","vi":"① Đặt 1 trứng onsen vào giữa","ne":"① बीचमा १ वटा ओन्सेन अण्डा राख्नुहोस्","id":"① Letakkan 1 telur onsen di tengah","my":"① ဥနွေး ၁ လုံး အလည်တွင် တင်ပါ"},
                        {"ja":"② 刻みネギをたっぷり散らす","en":"② Scatter plenty of chopped green onion","vi":"② Rắc nhiều hành lá thái nhỏ","ne":"② कटेको हरियो प्याज प्रशस्त छर्नुहोस्","id":"② Taburkan banyak daun bawang cincang","my":"② မြိတ်နက် ညှပ်ထားသောတစ်ခုကို ကျယ်ကျယ်ဖြန်ပါ"},
                        {"ja":"③ 白ごま・海苔を添えて完成","en":"③ Add white sesame and nori to finish","vi":"③ Thêm mè trắng và rong biển là xong","ne":"③ सेतो तिल र नोरी राखेर सक्नुहोस्","id":"③ Tambahkan wijen putih dan nori, selesai","my":"③ ဖြူသောနှမ်းနှင့် ဆီဖတ်ပင်ထည့်ပြီး ပြီးဆုံးသည်"},
                    ]))),
                ],
            },
        ]

        for m in demo_menus:
            menu_obj = models.Menu(name=m["name"], category=m["category"], is_active=True)
            db.add(menu_obj)
            db.flush()
            for step_num, task_type, desc in m["steps"]:
                db.add(models.MenuStep(
                    menu_id=menu_obj.id,
                    step=step_num,
                    task_type=task_type,
                    description=desc,
                ))
        db.commit()
        print("[DEMO] Menu seeded with i18n descriptions")
    except Exception as e:
        db.rollback()
        print(f"[DEMO] Seed failed: {e}")
    finally:
        db.close()


seed_demo_data()


def seed_demo_order():
    """練習用: テーブルA1の味噌ラーメン注文を初回起動時に投入"""
    db = SessionLocal()
    try:
        if db.query(models.Order).first():
            return

        menu = db.query(models.Menu).filter(models.Menu.name == "味噌ラーメン").first()
        if not menu:
            return

        order = models.Order(table_number="A1", status=models.OrderStatus.pending, priority=0)
        db.add(order)
        db.flush()

        item = models.OrderItem(order_id=order.id, menu_name=menu.name, quantity=1, note=None)
        db.add(item)
        db.flush()

        station_map = {"仕込み": "prep", "調理": "cooking", "盛付": "plating"}
        for s in menu.steps:
            db.add(models.Task(
                order_item_id=item.id,
                step=s.step,
                task_type=s.task_type,
                description=s.description,
                status=models.TaskStatus.pending,
                assigned_station=station_map.get(s.task_type, "cooking"),
            ))

        db.commit()
        print("[DEMO] Order seeded: Table A1 - Miso Ramen")
    except Exception as e:
        db.rollback()
        print(f"[DEMO] Order seed failed: {e}")
    finally:
        db.close()


def migrate_task_descriptions():
    """既存タスクのdescriptionをMenuStepからi18n形式に再コピー"""
    db = SessionLocal()
    try:
        tasks = db.query(models.Task).all()
        updated = 0
        for task in tasks:
            if task.description:
                try:
                    parsed = json.loads(task.description)
                    if isinstance(parsed, dict) and "ja" in parsed:
                        continue
                except Exception:
                    pass
            item = db.query(models.OrderItem).filter(
                models.OrderItem.id == task.order_item_id
            ).first()
            if item:
                menu_obj = db.query(models.Menu).filter(
                    models.Menu.name == item.menu_name
                ).first()
                if menu_obj:
                    step = db.query(models.MenuStep).filter(
                        models.MenuStep.menu_id == menu_obj.id,
                        models.MenuStep.step == task.step,
                    ).first()
                    if step and step.description:
                        task.description = step.description
                        updated += 1
        if updated:
            db.commit()
            print(f"[MIGRATE] Updated {updated} task descriptions to i18n format")
    except Exception as e:
        db.rollback()
        print(f"[MIGRATE] Migration failed: {e}")
    finally:
        db.close()


migrate_task_descriptions()
seed_demo_order()

app = FastAPI(
    title="Kitchen AI — KitchenOS",
    version="2.0.0",
    description="多言語対応・厨房オペレーション自動化システム",
)

import os as _os

_EXTRA_ORIGINS = _os.environ.get("CORS_ORIGINS", "")
_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
if _EXTRA_ORIGINS:
    _origins += [o.strip() for o in _EXTRA_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router)
app.include_router(prep.router)
app.include_router(menu.router)
app.include_router(dashboard.router)
app.include_router(external.router)
app.include_router(setup.router)
app.include_router(inventory.router)
app.include_router(cooking_history.router)
app.include_router(predict.router)
app.include_router(tasks_now.router)

# inventory ルーターに WebSocket manager を注入
inventory.set_manager(manager)

# アップロード済み画像を静的ファイルとして配信
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 10 * 1024 * 1024  # 10MB


@app.post("/api/upload/photo")
async def upload_photo(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="JPEG/PNG/WebPのみ対応")
    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="ファイルサイズは10MB以内")
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
        f.write(data)
    return {"url": f"/uploads/{filename}"}


VALID_STATIONS = {"cooking", "plating", "prep", "admin", "table"}


@app.websocket("/ws/{station_type}")
async def websocket_endpoint(websocket: WebSocket, station_type: str):
    """
    ステーション別WebSocket接続:
      /ws/cooking  — 調理担当
      /ws/plating  — 盛付担当
      /ws/prep     — 仕込み担当
      /ws/admin    — 管理（全表示）
      /ws/table    — 客席・カウンタータブレット
    """
    if station_type not in VALID_STATIONS:
        await websocket.close(code=4000)
        return

    await manager.connect(websocket, station_type)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, station_type)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "KitchenOS", "version": "2.0.0"}
