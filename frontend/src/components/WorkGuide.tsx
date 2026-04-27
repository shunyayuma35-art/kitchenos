import type { StationType, Language } from "../types";

interface Props {
  station: StationType;
  language: Language;
}

interface Step { icon: string; title: string; desc: string; color: string }
interface Guide { title: string; steps: Step[]; tips: string[] }

// ─── ガイドコンテンツ（全言語） ──────────────────────────────────
const GUIDES: Partial<Record<Language, Record<StationType, Guide>>> = {
  // ── 日本語 ──────────────────────────────────────────────────────
  ja: {
    prep: {
      title: "🥬 仕込み担当 — 作業手順",
      steps: [
        { icon:"1", color:"#27ae60", title:"アプリを開く",      desc:"仕込みステーションでログイン。仕込みタスクの一覧が表示されます。" },
        { icon:"2", color:"#27ae60", title:"注文を確認する",    desc:"「注文一覧」に新しい注文が届いたら内容（メニュー・テーブル番号）を確認します。" },
        { icon:"3", color:"#27ae60", title:"「開始」を押す",    desc:"タスクカードの「開始」ボタンを押します。作業中ステータスに変わります。" },
        { icon:"4", color:"#27ae60", title:"仕込みを行う",      desc:"スープの準備・食材のカット・下味つけなど、各メニューの仕込み手順を実施します。" },
        { icon:"5", color:"#27ae60", title:"「完了」を押す",    desc:"仕込みが終わったら「✓ 完了」を押します。自動で調理担当に次の指示が届きます。" },
      ],
      tips: ["仕込みが完了すると、自動で調理担当に次のタスクが届きます", "複数の注文がある場合は上から順に対応してください"],
    },
    cooking: {
      title: "🔥 調理担当 — 作業手順",
      steps: [
        { icon:"1", color:"#f39c12", title:"アプリを開く",      desc:"調理ステーションでログイン。調理タスクの一覧が表示されます。" },
        { icon:"2", color:"#f39c12", title:"タスクを確認する",  desc:"仕込み完了後に届いた調理タスクを確認します。テーブル番号・メニュー・数量をチェック。" },
        { icon:"3", color:"#f39c12", title:"「開始」を押す",    desc:"「開始」ボタンを押してから調理を始めます。経過時間が記録されます。" },
        { icon:"4", color:"#f39c12", title:"調理を行う",        desc:"麺を茹でる・スープを注ぐなど、メニューごとの調理手順を実施します。" },
        { icon:"5", color:"#f39c12", title:"「完了」を押す",    desc:"調理が終わったら「✓ 完了」を押します。自動で盛付担当に指示が届きます。" },
      ],
      tips: ["調理中に問題があれば管理担当に口頭で連絡してください", "「開始」を押すことで作業時間が記録されます"],
    },
    plating: {
      title: "🍽️ 盛付担当 — 作業手順",
      steps: [
        { icon:"1", color:"#9b59b6", title:"アプリを開く",              desc:"盛付ステーションでログイン。盛付タスクが表示されます。" },
        { icon:"2", color:"#9b59b6", title:"タスクを確認する",          desc:"調理完了後に届いたタスクを確認。テーブル番号を間違えないよう確認します。" },
        { icon:"3", color:"#9b59b6", title:"「開始」を押す",            desc:"「開始」を押してから盛り付けを始めます。" },
        { icon:"4", color:"#9b59b6", title:"盛り付けを行う",            desc:"トッピング・添え物を乗せて料理を完成させます。" },
        { icon:"5", color:"#9b59b6", title:"📸 写真を撮る（任意）",    desc:"「📸 写真を撮る」ボタンでカメラが起動。料理の写真を撮ると品質記録に残ります。" },
        { icon:"6", color:"#9b59b6", title:"「完了」を押す",            desc:"「✓ 完了」を押します。全品揃ったら全スタッフに「提供OK」通知が届きます。" },
      ],
      tips: ["写真は任意ですが、品質管理に役立ちます", "テーブル番号を必ず確認してから料理を出してください"],
    },
    admin: {
      title: "📊 管理担当 — 作業手順",
      steps: [
        { icon:"1", color:"#e94560", title:"注文を受ける",      desc:"お客様から注文を受けたら「+ 新規注文」タブを開きます。" },
        { icon:"2", color:"#e94560", title:"注文を入力する",    desc:"テーブル番号・メニューを選択して「送信」。各担当に自動で指示が届きます。" },
        { icon:"3", color:"#e94560", title:"進捗を確認する",    desc:"「注文一覧」タブで各タスクの進捗をリアルタイムで確認できます。" },
        { icon:"4", color:"#e94560", title:"仕込みを管理する",  desc:"「仕込み作業」タブで仕込みタスクを登録・管理できます。" },
        { icon:"5", color:"#e94560", title:"完了ログを確認する",desc:"「完了ログ」タブで誰が・いつ・何を完了したか確認できます。" },
        { icon:"6", color:"#e94560", title:"メニューを登録する",desc:"「メニュー管理」タブで新しいメニューと調理手順を登録・編集できます。" },
      ],
      tips: ["注文送信後は各ステーションに自動で指示が届きます", "完了ログで当日の全作業履歴を確認できます"],
    },
    table: {
      title: "🪑 テーブル端末 — 使い方",
      steps: [
        { icon:"1", color:"#7fb3ff", title:"テーブル番号を設定", desc:"このタブレットのテーブル番号を設定してください。" },
        { icon:"2", color:"#7fb3ff", title:"待機中",             desc:"注文が入ると「調理中」に切り替わります。" },
        { icon:"3", color:"#7fb3ff", title:"調理中",             desc:"スタッフが調理・盛付を進めています。しばらくお待ちください。" },
        { icon:"4", color:"#7fb3ff", title:"提供OK通知",         desc:"全品揃うと「お料理の準備ができました」と画面に表示されます。" },
      ],
      tips: ["画面をタップして言語を切り替えられます"],
    },
  },

  // ── English ─────────────────────────────────────────────────────
  en: {
    prep: {
      title: "🥬 Prep Station — Work Guide",
      steps: [
        { icon:"1", color:"#27ae60", title:"Open the app",        desc:"Log in at the Prep station. Your list of prep tasks will be displayed." },
        { icon:"2", color:"#27ae60", title:"Check orders",        desc:"When a new order arrives in the order list, check the menu items and table number." },
        { icon:"3", color:"#27ae60", title:"Tap 'Start'",         desc:"Press the Start button on the task card. The status changes to 'In Progress'." },
        { icon:"4", color:"#27ae60", title:"Do prep work",        desc:"Prepare the soup, cut ingredients, apply seasoning, etc. according to each menu's prep steps." },
        { icon:"5", color:"#27ae60", title:"Tap 'Complete'",      desc:"When prep is done, press ✓ Complete. The cooking station will automatically receive the next instruction." },
      ],
      tips: ["When prep is completed, the cooking station is automatically notified", "If there are multiple orders, handle them from top to bottom"],
    },
    cooking: {
      title: "🔥 Cooking Station — Work Guide",
      steps: [
        { icon:"1", color:"#f39c12", title:"Open the app",       desc:"Log in at the Cooking station. Your cooking tasks will be displayed." },
        { icon:"2", color:"#f39c12", title:"Check the task",     desc:"Review the cooking task that arrived after prep is done. Check table number, menu, and quantity." },
        { icon:"3", color:"#f39c12", title:"Tap 'Start'",        desc:"Press Start before you begin cooking. Your working time will be recorded." },
        { icon:"4", color:"#f39c12", title:"Cook the dish",      desc:"Boil noodles, pour soup, etc. Follow the cooking steps for each menu." },
        { icon:"5", color:"#f39c12", title:"Tap 'Complete'",     desc:"When cooking is done, press ✓ Complete. The plating station will automatically receive the instruction." },
      ],
      tips: ["If there is a problem during cooking, notify the admin staff verbally", "Pressing 'Start' records your working time"],
    },
    plating: {
      title: "🍽️ Plating Station — Work Guide",
      steps: [
        { icon:"1", color:"#9b59b6", title:"Open the app",              desc:"Log in at the Plating station. Plating tasks will be displayed." },
        { icon:"2", color:"#9b59b6", title:"Check the task",            desc:"Review the task that arrived after cooking. Double-check the table number." },
        { icon:"3", color:"#9b59b6", title:"Tap 'Start'",               desc:"Press Start before you begin plating." },
        { icon:"4", color:"#9b59b6", title:"Plate the dish",            desc:"Add toppings and garnishes to complete the dish." },
        { icon:"5", color:"#9b59b6", title:"📸 Take a photo (optional)",desc:"Press the 📸 photo button to open the camera. Taking a photo keeps a quality record." },
        { icon:"6", color:"#9b59b6", title:"Tap 'Complete'",            desc:"Press ✓ Complete. When all dishes are ready, all staff receive a 'Ready to Serve' notification." },
      ],
      tips: ["Photos are optional but useful for quality control", "Always confirm the table number before bringing out the food"],
    },
    admin: {
      title: "📊 Admin Station — Work Guide",
      steps: [
        { icon:"1", color:"#e94560", title:"Receive an order",     desc:"When you receive an order from a customer, open the '+ New Order' tab." },
        { icon:"2", color:"#e94560", title:"Enter the order",      desc:"Select table number and menu items, then press Submit. Instructions are sent automatically to each station." },
        { icon:"3", color:"#e94560", title:"Monitor progress",     desc:"In the Orders tab, you can monitor the real-time status of each task (Pending / In Progress / Completed)." },
        { icon:"4", color:"#e94560", title:"Manage prep work",     desc:"In the Prep Work tab, you can register and manage pre-service prep tasks." },
        { icon:"5", color:"#e94560", title:"Review completion log",desc:"In the Completion Log tab, you can see who completed what and when. Plating photos are also viewable." },
        { icon:"6", color:"#e94560", title:"Register menus",       desc:"In the Menu Management tab, you can register and edit new menus and cooking steps." },
      ],
      tips: ["After submitting an order, instructions are sent automatically to each station", "Use the completion log to review all work history for the day"],
    },
    table: {
      title: "🪑 Table Terminal — How to Use",
      steps: [
        { icon:"1", color:"#7fb3ff", title:"Set table number",  desc:"Please set the table number for this tablet." },
        { icon:"2", color:"#7fb3ff", title:"Waiting",           desc:"Once your order is placed, the status will change to 'Preparing'." },
        { icon:"3", color:"#7fb3ff", title:"Preparing",         desc:"Staff are cooking and plating your order. Please wait a moment." },
        { icon:"4", color:"#7fb3ff", title:"Ready notification",desc:"When all dishes are ready, 'Your food is ready!' will appear on the screen." },
      ],
      tips: ["Tap the screen to change the display language"],
    },
  },

  // ── Tiếng Việt ──────────────────────────────────────────────────
  vi: {
    prep: {
      title: "🥬 Trạm Chuẩn bị — Hướng dẫn",
      steps: [
        { icon:"1", color:"#27ae60", title:"Mở ứng dụng",           desc:"Đăng nhập tại trạm chuẩn bị. Danh sách công việc chuẩn bị sẽ hiển thị." },
        { icon:"2", color:"#27ae60", title:"Kiểm tra đơn hàng",     desc:"Khi có đơn hàng mới, kiểm tra nội dung (món ăn, số bàn)." },
        { icon:"3", color:"#27ae60", title:"Nhấn 'Bắt đầu'",        desc:"Nhấn nút Bắt đầu trên thẻ công việc. Trạng thái chuyển sang Đang làm." },
        { icon:"4", color:"#27ae60", title:"Thực hiện chuẩn bị",    desc:"Chuẩn bị súp, cắt nguyên liệu, ướp gia vị theo từng món." },
        { icon:"5", color:"#27ae60", title:"Nhấn 'Hoàn thành'",     desc:"Khi xong, nhấn ✓ Hoàn thành. Trạm nấu ăn sẽ tự động nhận lệnh tiếp theo." },
      ],
      tips: ["Khi chuẩn bị xong, trạm nấu ăn sẽ tự động nhận thông báo", "Nếu có nhiều đơn, xử lý từ trên xuống"],
    },
    cooking: {
      title: "🔥 Trạm Nấu ăn — Hướng dẫn",
      steps: [
        { icon:"1", color:"#f39c12", title:"Mở ứng dụng",          desc:"Đăng nhập tại trạm nấu. Danh sách công việc nấu ăn hiển thị." },
        { icon:"2", color:"#f39c12", title:"Kiểm tra công việc",   desc:"Xem công việc nấu đến sau khi chuẩn bị xong. Kiểm tra số bàn, món, số lượng." },
        { icon:"3", color:"#f39c12", title:"Nhấn 'Bắt đầu'",       desc:"Nhấn Bắt đầu trước khi nấu. Thời gian làm việc được ghi lại." },
        { icon:"4", color:"#f39c12", title:"Nấu món ăn",           desc:"Luộc mì, đổ súp... Thực hiện theo các bước nấu của từng món." },
        { icon:"5", color:"#f39c12", title:"Nhấn 'Hoàn thành'",    desc:"Khi nấu xong, nhấn ✓ Hoàn thành. Trạm bày đĩa sẽ tự nhận lệnh." },
      ],
      tips: ["Nếu có vấn đề khi nấu, hãy báo ngay cho quản lý", "Nhấn 'Bắt đầu' để ghi lại thời gian làm việc"],
    },
    plating: {
      title: "🍽️ Trạm Trình bày — Hướng dẫn",
      steps: [
        { icon:"1", color:"#9b59b6", title:"Mở ứng dụng",                  desc:"Đăng nhập tại trạm trình bày. Danh sách bày đĩa hiển thị." },
        { icon:"2", color:"#9b59b6", title:"Kiểm tra công việc",           desc:"Xem công việc sau khi nấu xong. Kiểm tra kỹ số bàn." },
        { icon:"3", color:"#9b59b6", title:"Nhấn 'Bắt đầu'",              desc:"Nhấn Bắt đầu trước khi bày đĩa." },
        { icon:"4", color:"#9b59b6", title:"Bày món ăn",                   desc:"Thêm topping và trang trí để hoàn thiện món." },
        { icon:"5", color:"#9b59b6", title:"📸 Chụp ảnh (tùy chọn)",     desc:"Nhấn nút 📸 để mở camera. Chụp ảnh lưu lại hồ sơ chất lượng." },
        { icon:"6", color:"#9b59b6", title:"Nhấn 'Hoàn thành'",            desc:"Nhấn ✓ Hoàn thành. Khi đủ tất cả món, thông báo phục vụ được gửi tới mọi người." },
      ],
      tips: ["Ảnh không bắt buộc nhưng hữu ích để kiểm soát chất lượng", "Luôn xác nhận số bàn trước khi mang món ra"],
    },
    admin: {
      title: "📊 Trạm Quản lý — Hướng dẫn",
      steps: [
        { icon:"1", color:"#e94560", title:"Nhận đơn hàng",        desc:"Khi nhận đơn từ khách, mở tab '+ Đơn mới'." },
        { icon:"2", color:"#e94560", title:"Nhập đơn hàng",        desc:"Chọn số bàn và món, nhấn Gửi. Lệnh tự động đến từng trạm." },
        { icon:"3", color:"#e94560", title:"Theo dõi tiến độ",     desc:"Tab Danh sách đơn hiển thị trạng thái thực tế của từng công việc." },
        { icon:"4", color:"#e94560", title:"Quản lý chuẩn bị",     desc:"Tab Chuẩn bị để đăng ký và quản lý công việc chuẩn bị trước giờ mở cửa." },
        { icon:"5", color:"#e94560", title:"Xem nhật ký hoàn thành",desc:"Tab Nhật ký hiển thị ai đã làm gì và khi nào. Có thể xem ảnh bày đĩa." },
        { icon:"6", color:"#e94560", title:"Đăng ký menu",         desc:"Tab Quản lý menu để đăng ký và chỉnh sửa món mới và các bước nấu." },
      ],
      tips: ["Sau khi gửi đơn, lệnh tự động đến từng trạm", "Dùng nhật ký để xem lại toàn bộ lịch sử làm việc trong ngày"],
    },
    table: {
      title: "🪑 Màn hình Bàn — Hướng dẫn",
      steps: [
        { icon:"1", color:"#7fb3ff", title:"Đặt số bàn",          desc:"Vui lòng đặt số bàn cho máy tính bảng này." },
        { icon:"2", color:"#7fb3ff", title:"Chờ",                  desc:"Sau khi đặt món, trạng thái chuyển sang Đang chuẩn bị." },
        { icon:"3", color:"#7fb3ff", title:"Đang chuẩn bị",       desc:"Nhân viên đang nấu và bày đĩa. Vui lòng chờ giây lát." },
        { icon:"4", color:"#7fb3ff", title:"Thông báo sẵn sàng",  desc:"Khi tất cả món sẵn sàng, màn hình sẽ hiển thị thông báo." },
      ],
      tips: ["Nhấn vào màn hình để đổi ngôn ngữ hiển thị"],
    },
  },

  // ── नेपाली ──────────────────────────────────────────────────────
  ne: {
    prep: {
      title: "🥬 तयारी स्टेशन — कार्य निर्देशिका",
      steps: [
        { icon:"1", color:"#27ae60", title:"एप खोल्नुहोस्",         desc:"तयारी स्टेशनमा लगइन गर्नुहोस्। तयारी कार्यहरूको सूची देखिनेछ।" },
        { icon:"2", color:"#27ae60", title:"अर्डर जाँच्नुहोस्",     desc:"नयाँ अर्डर आएमा सामग्री (मेनु, टेबल नम्बर) जाँच्नुहोस्।" },
        { icon:"3", color:"#27ae60", title:"'सुरु' थिच्नुहोस्",     desc:"कार्ड मा 'सुरु' बटन थिच्नुहोस्। स्थिति 'काम भइरहेको' मा बदलिनेछ।" },
        { icon:"4", color:"#27ae60", title:"तयारी गर्नुहोस्",       desc:"सुप तयार गर्नुहोस्, सामग्री काट्नुहोस्, मरिनेड लगाउनुहोस्।" },
        { icon:"5", color:"#27ae60", title:"'सम्पन्न' थिच्नुहोस्",  desc:"तयारी सकिएपछि ✓ सम्पन्न थिच्नुहोस्। पकाउने स्टेशनलाई स्वतः निर्देशन जानेछ।" },
      ],
      tips: ["तयारी सकिएपछि पकाउने स्टेशनलाई स्वतः सूचना जान्छ", "धेरै अर्डर भएमा माथिदेखि क्रमले गर्नुहोस्"],
    },
    cooking: {
      title: "🔥 पकाउने स्टेशन — कार्य निर्देशिका",
      steps: [
        { icon:"1", color:"#f39c12", title:"एप खोल्नुहोस्",        desc:"पकाउने स्टेशनमा लगइन गर्नुहोस्। पकाउने कार्यहरू देखिनेछन्।" },
        { icon:"2", color:"#f39c12", title:"कार्य जाँच्नुहोस्",    desc:"तयारी सकिएपछि आएको कार्य जाँच्नुहोस्। टेबल नम्बर, मेनु, मात्रा जाँच्नुहोस्।" },
        { icon:"3", color:"#f39c12", title:"'सुरु' थिच्नुहोस्",    desc:"पकाउनु अघि 'सुरु' थिच्नुहोस्। काम गर्ने समय रेकर्ड हुनेछ।" },
        { icon:"4", color:"#f39c12", title:"खाना पकाउनुहोस्",      desc:"नुडल उमाल्नुहोस्, सुप हाल्नुहोस् आदि। प्रत्येक मेनुको चरण पालन गर्नुहोस्।" },
        { icon:"5", color:"#f39c12", title:"'सम्पन्न' थिच्नुहोस्", desc:"पकाइ सकिएपछि ✓ सम्पन्न थिच्नुहोस्। सजाउने स्टेशनलाई स्वतः सूचना जानेछ।" },
      ],
      tips: ["पकाउँदा समस्या भएमा व्यवस्थापकलाई भन्नुहोस्", "'सुरु' थिच्दा काम गर्ने समय रेकर्ड हुन्छ"],
    },
    plating: {
      title: "🍽️ सजाउने स्टेशन — कार्य निर्देशिका",
      steps: [
        { icon:"1", color:"#9b59b6", title:"एप खोल्नुहोस्",               desc:"सजाउने स्टेशनमा लगइन गर्नुहोस्।" },
        { icon:"2", color:"#9b59b6", title:"कार्य जाँच्नुहोस्",          desc:"पकाइ सकिएपछि आएको कार्य जाँच्नुहोस्। टेबल नम्बर पक्का गर्नुहोस्।" },
        { icon:"3", color:"#9b59b6", title:"'सुरु' थिच्नुहोस्",          desc:"सजाउनु अघि 'सुरु' थिच्नुहोस्।" },
        { icon:"4", color:"#9b59b6", title:"खाना सजाउनुहोस्",            desc:"टपिङ र गार्निश थपेर खाना पूर्ण गर्नुहोस्।" },
        { icon:"5", color:"#9b59b6", title:"📸 फोटो खिच्नुहोस् (ऐच्छिक)", desc:"📸 बटन थिच्दा क्यामेरा खुल्छ। फोटो राख्दा गुणस्तर रेकर्ड हुन्छ।" },
        { icon:"6", color:"#9b59b6", title:"'सम्पन्न' थिच्नुहोस्",       desc:"✓ सम्पन्न थिच्नुहोस्। सबै खाना तयार भएमा सबैलाई 'परिवेशन OK' सूचना जानेछ।" },
      ],
      tips: ["फोटो ऐच्छिक छ तर गुणस्तर व्यवस्थापनमा उपयोगी छ", "खाना दिनु अघि टेबल नम्बर पक्का गर्नुहोस्"],
    },
    admin: {
      title: "📊 व्यवस्थापन स्टेशन — कार्य निर्देशिका",
      steps: [
        { icon:"1", color:"#e94560", title:"अर्डर लिनुहोस्",        desc:"ग्राहकबाट अर्डर लिँदा '+ नयाँ अर्डर' ट्याब खोल्नुहोस्।" },
        { icon:"2", color:"#e94560", title:"अर्डर प्रविष्ट गर्नुहोस्",desc:"टेबल नम्बर र मेनु छानेर 'पठाउनुहोस्'। प्रत्येक स्टेशनलाई स्वतः निर्देशन जान्छ।" },
        { icon:"3", color:"#e94560", title:"प्रगति जाँच्नुहोस्",    desc:"'अर्डर सूची' ट्याबमा प्रत्येक कार्यको रियल-टाइम अवस्था हेर्न सकिन्छ।" },
        { icon:"4", color:"#e94560", title:"तयारी व्यवस्थापन",       desc:"'तयारी कार्य' ट्याबमा तयारी कार्यहरू दर्ता र व्यवस्थापन गर्नुहोस्।" },
        { icon:"5", color:"#e94560", title:"लग जाँच्नुहोस्",         desc:"'पूर्णता लग' ट्याबमा कसले, कहिले, के पूरा गर्‍यो भन्ने देख्न सकिन्छ।" },
        { icon:"6", color:"#e94560", title:"मेनु दर्ता गर्नुहोस्",   desc:"'मेनु व्यवस्थापन' ट्याबमा नयाँ मेनु र पकाउने चरणहरू दर्ता/सम्पादन गर्नुहोस्।" },
      ],
      tips: ["अर्डर पठाएपछि स्वतः प्रत्येक स्टेशनमा निर्देशन जान्छ", "पूर्णता लगबाट दैनिक सम्पूर्ण कार्य इतिहास हेर्न सकिन्छ"],
    },
    table: {
      title: "🪑 टेबल टर्मिनल — प्रयोग विधि",
      steps: [
        { icon:"1", color:"#7fb3ff", title:"टेबल नम्बर सेट गर्नुहोस्",desc:"यो ट्याब्लेटको टेबल नम्बर सेट गर्नुहोस्।" },
        { icon:"2", color:"#7fb3ff", title:"प्रतीक्षा",               desc:"अर्डर गरेपछि अवस्था 'तयारी भइरहेको' मा बदलिनेछ।" },
        { icon:"3", color:"#7fb3ff", title:"तयारी भइरहेको",           desc:"कर्मचारीहरू पकाउँदै र सजाउँदै छन्। कृपया प्रतीक्षा गर्नुहोस्।" },
        { icon:"4", color:"#7fb3ff", title:"तयार सूचना",              desc:"सबै खाना तयार भएमा स्क्रिनमा सूचना देखिनेछ।" },
      ],
      tips: ["भाषा परिवर्तन गर्न स्क्रिन ट्याप गर्नुहोस्"],
    },
  },

  // ── Bahasa Indonesia ────────────────────────────────────────────
  id: {
    prep: {
      title: "🥬 Stasiun Persiapan — Panduan Kerja",
      steps: [
        { icon:"1", color:"#27ae60", title:"Buka aplikasi",           desc:"Login di stasiun persiapan. Daftar tugas persiapan akan ditampilkan." },
        { icon:"2", color:"#27ae60", title:"Periksa pesanan",         desc:"Saat pesanan baru masuk, periksa isinya (menu, nomor meja)." },
        { icon:"3", color:"#27ae60", title:"Tekan 'Mulai'",           desc:"Tekan tombol Mulai pada kartu tugas. Status berubah menjadi Sedang proses." },
        { icon:"4", color:"#27ae60", title:"Lakukan persiapan",       desc:"Siapkan kaldu, potong bahan, marinasi, dll. sesuai langkah tiap menu." },
        { icon:"5", color:"#27ae60", title:"Tekan 'Selesai'",         desc:"Setelah selesai, tekan ✓ Selesai. Stasiun memasak akan otomatis menerima instruksi berikutnya." },
      ],
      tips: ["Saat persiapan selesai, stasiun memasak otomatis mendapat notifikasi", "Jika ada beberapa pesanan, kerjakan dari atas ke bawah"],
    },
    cooking: {
      title: "🔥 Stasiun Memasak — Panduan Kerja",
      steps: [
        { icon:"1", color:"#f39c12", title:"Buka aplikasi",          desc:"Login di stasiun memasak. Daftar tugas memasak akan ditampilkan." },
        { icon:"2", color:"#f39c12", title:"Periksa tugas",          desc:"Tinjau tugas memasak yang datang setelah persiapan selesai. Cek nomor meja, menu, dan jumlah." },
        { icon:"3", color:"#f39c12", title:"Tekan 'Mulai'",          desc:"Tekan Mulai sebelum memasak. Waktu kerja akan dicatat." },
        { icon:"4", color:"#f39c12", title:"Masak hidangan",         desc:"Rebus mie, tuang kaldu, dll. Ikuti langkah memasak setiap menu." },
        { icon:"5", color:"#f39c12", title:"Tekan 'Selesai'",        desc:"Setelah selesai memasak, tekan ✓ Selesai. Stasiun plating akan otomatis menerima instruksi." },
      ],
      tips: ["Jika ada masalah saat memasak, beritahu admin secara lisan", "Menekan 'Mulai' akan mencatat waktu kerja Anda"],
    },
    plating: {
      title: "🍽️ Stasiun Plating — Panduan Kerja",
      steps: [
        { icon:"1", color:"#9b59b6", title:"Buka aplikasi",               desc:"Login di stasiun plating. Tugas plating akan ditampilkan." },
        { icon:"2", color:"#9b59b6", title:"Periksa tugas",               desc:"Tinjau tugas yang datang setelah memasak. Pastikan nomor meja benar." },
        { icon:"3", color:"#9b59b6", title:"Tekan 'Mulai'",               desc:"Tekan Mulai sebelum melakukan plating." },
        { icon:"4", color:"#9b59b6", title:"Tata hidangan",               desc:"Tambahkan topping dan hiasan untuk menyempurnakan hidangan." },
        { icon:"5", color:"#9b59b6", title:"📸 Foto (opsional)",          desc:"Tekan tombol 📸 untuk membuka kamera. Foto disimpan sebagai catatan kualitas." },
        { icon:"6", color:"#9b59b6", title:"Tekan 'Selesai'",             desc:"Tekan ✓ Selesai. Saat semua hidangan siap, notifikasi 'Siap disajikan' dikirim ke semua." },
      ],
      tips: ["Foto bersifat opsional tapi berguna untuk kontrol kualitas", "Selalu konfirmasi nomor meja sebelum mengeluarkan makanan"],
    },
    admin: {
      title: "📊 Stasiun Admin — Panduan Kerja",
      steps: [
        { icon:"1", color:"#e94560", title:"Terima pesanan",         desc:"Saat menerima pesanan dari pelanggan, buka tab '+ Pesanan Baru'." },
        { icon:"2", color:"#e94560", title:"Masukkan pesanan",       desc:"Pilih nomor meja dan menu, lalu tekan Kirim. Instruksi otomatis dikirim ke setiap stasiun." },
        { icon:"3", color:"#e94560", title:"Pantau kemajuan",        desc:"Di tab Pesanan, Anda dapat memantau status setiap tugas secara real-time." },
        { icon:"4", color:"#e94560", title:"Kelola persiapan",       desc:"Di tab Persiapan, daftarkan dan kelola tugas persiapan sebelum buka." },
        { icon:"5", color:"#e94560", title:"Tinjau log selesai",     desc:"Di tab Log, Anda dapat melihat siapa yang menyelesaikan apa dan kapan. Foto plating juga tersedia." },
        { icon:"6", color:"#e94560", title:"Daftarkan menu",         desc:"Di tab Kelola Menu, daftarkan dan edit menu baru beserta langkah memasaknya." },
      ],
      tips: ["Setelah mengirim pesanan, instruksi otomatis dikirim ke setiap stasiun", "Gunakan log untuk meninjau seluruh riwayat kerja hari ini"],
    },
    table: {
      title: "🪑 Terminal Meja — Cara Pakai",
      steps: [
        { icon:"1", color:"#7fb3ff", title:"Atur nomor meja",        desc:"Harap atur nomor meja untuk tablet ini." },
        { icon:"2", color:"#7fb3ff", title:"Menunggu",               desc:"Setelah pesanan masuk, status berubah menjadi Sedang dimasak." },
        { icon:"3", color:"#7fb3ff", title:"Sedang dimasak",         desc:"Staf sedang memasak dan menata hidangan Anda. Mohon tunggu sebentar." },
        { icon:"4", color:"#7fb3ff", title:"Notifikasi siap",        desc:"Saat semua hidangan siap, notifikasi akan muncul di layar." },
      ],
      tips: ["Ketuk layar untuk mengganti bahasa tampilan"],
    },
  },

  // ── မြန်မာဘာသာ ──────────────────────────────────────────────────
  my: {
    prep: {
      title: "🥬 ကြိုတင်ပြင်ဆင်မှု — လုပ်ငန်းလမ်းညွှန်",
      steps: [
        { icon:"1", color:"#27ae60", title:"အက်ပ်ဖွင့်ပါ",              desc:"ကြိုတင်ပြင်ဆင်မှုနေရာတွင် ဝင်ရောက်ပါ။ လုပ်ဆောင်ရမည့် အလုပ်များ ပေါ်လာမည်။" },
        { icon:"2", color:"#27ae60", title:"အော်ဒါစစ်ဆေးပါ",           desc:"အော်ဒါအသစ်ရောက်လာလျှင် မာနူး၊ စားပွဲနံပါတ် စစ်ဆေးပါ။" },
        { icon:"3", color:"#27ae60", title:"'စတင်' နှိပ်ပါ",            desc:"'စတင်' ကို နှိပ်ပါ။ အခြေအနေ 'လုပ်ဆောင်နေ' သို့ ပြောင်းသွားမည်။" },
        { icon:"4", color:"#27ae60", title:"ကြိုတင်ပြင်ဆင်ပါ",         desc:"ဟင်းချိုပြင်ဆင်ပါ၊ အသားများ ဖြတ်တောက်ပါ၊ ဂျိုင်းဆမ်ကြပ်ပါ။" },
        { icon:"5", color:"#27ae60", title:"'ပြီးဆုံး' နှိပ်ပါ",         desc:"ပြင်ဆင်မှုပြီးလျှင် ✓ ပြီးဆုံး နှိပ်ပါ။ ချက်ပြုတ်မှုနေရာသို့ အလိုအလျောက် ညွှန်ကြားချက်ရောက်မည်။" },
      ],
      tips: ["ကြိုတင်ပြင်ဆင်မှုပြီးလျှင် ချက်ပြုတ်မှုနေရာသို့ အလိုအလျောက် အကြောင်းကြားမည်", "အော်ဒါများစွာဆိုလျှင် အပေါ်ဆုံးမှ အစဉ်လိုက် ဆောင်ရွက်ပါ"],
    },
    cooking: {
      title: "🔥 ချက်ပြုတ်မှုနေရာ — လုပ်ငန်းလမ်းညွှန်",
      steps: [
        { icon:"1", color:"#f39c12", title:"အက်ပ်ဖွင့်ပါ",             desc:"ချက်ပြုတ်မှုနေရာတွင် ဝင်ရောက်ပါ။ ချက်ပြုတ်ရမည့် အလုပ်များ ပေါ်လာမည်။" },
        { icon:"2", color:"#f39c12", title:"အလုပ်စစ်ဆေးပါ",           desc:"ကြိုတင်ပြင်ဆင်မှုပြီးနောက် ရောက်လာသောအလုပ်ကို စစ်ဆေးပါ။ စားပွဲနံပါတ်၊ မာနူး၊ ပမာဏ စစ်ဆေးပါ။" },
        { icon:"3", color:"#f39c12", title:"'စတင်' နှိပ်ပါ",           desc:"ချက်မချင်း မချက်ပြုတ်ဘဲ 'စတင်' ကို အရင်နှိပ်ပါ။ အချိန်မှတ်တမ်းတင်မည်။" },
        { icon:"4", color:"#f39c12", title:"ချက်ပြုတ်ပါ",              desc:"မုန့်ဖတ်ကြိတ်ပါ၊ ဟင်းချိုလောင်းပါ။ မာနူးတိုင်းအတွက် ချက်ပြုတ်မှုအဆင့်များ လိုက်နာပါ။" },
        { icon:"5", color:"#f39c12", title:"'ပြီးဆုံး' နှိပ်ပါ",        desc:"ချက်ပြုတ်မှုပြီးလျှင် ✓ ပြီးဆုံး နှိပ်ပါ။ ပန်းကန်ထည့်မှုနေရာသို့ အလိုအလျောက် ညွှန်ကြားချက်ရောက်မည်။" },
      ],
      tips: ["ချက်ပြုတ်ရင်း ပြဿနာဖြစ်လျှင် စီမံခန့်ခွဲသူကို အသိပေးပါ", "'စတင်' နှိပ်ခြင်းဖြင့် အလုပ်ချိန်မှတ်တမ်းတင်မည်"],
    },
    plating: {
      title: "🍽️ ပန်းကန်ထည့်မှုနေရာ — လုပ်ငန်းလမ်းညွှန်",
      steps: [
        { icon:"1", color:"#9b59b6", title:"အက်ပ်ဖွင့်ပါ",                    desc:"ပန်းကန်ထည့်မှုနေရာတွင် ဝင်ရောက်ပါ။" },
        { icon:"2", color:"#9b59b6", title:"အလုပ်စစ်ဆေးပါ",                 desc:"ချက်ပြုတ်မှုပြီးနောက် ရောက်လာသောအလုပ်ကို စစ်ဆေးပါ။ စားပွဲနံပါတ် အတည်ပြုပါ။" },
        { icon:"3", color:"#9b59b6", title:"'စတင်' နှိပ်ပါ",                 desc:"ပန်းကန်ထည့်မချင်း 'စတင်' ကို အရင်နှိပ်ပါ။" },
        { icon:"4", color:"#9b59b6", title:"ပန်းကန်ထည့်ပါ",                  desc:"ထောပတ်သီးနှင့် အလှဆင်ပြင်ပစ္စည်းများ ထည့်ပြီး အစားအစာ ပြီးဆုံးောင်ပြုလုပ်ပါ။" },
        { icon:"5", color:"#9b59b6", title:"📸 ဓာတ်ပုံရိုက်ပါ (ရွေးချယ်နိုင်)",desc:"📸 ခလုတ်နှိပ်ပါ ကင်မရာဖွင့်မည်။ ဓာတ်ပုံရိုက်ထားလျှင် အရည်အသွေးမှတ်တမ်းတွင် သိမ်းဆည်းမည်။" },
        { icon:"6", color:"#9b59b6", title:"'ပြီးဆုံး' နှိပ်ပါ",              desc:"✓ ပြီးဆုံး နှိပ်ပါ။ ဟင်းလျာအားလုံးပြင်ဆင်ပြီးလျှင် ဝန်ထမ်းအားလုံးထံ 'ဆောင်ရွက်ရန်အဆင်သင့်' အကြောင်းကြားမည်။" },
      ],
      tips: ["ဓာတ်ပုံသည် မဖြစ်မနေမဟုတ်သော်လည်း အရည်အသွေးထိန်းချုပ်မှုအတွက် အသုံးဝင်သည်", "အစားအစာထုတ်ခင် စားပွဲနံပါတ် အတည်ပြုပါ"],
    },
    admin: {
      title: "📊 စီမံခန့်ခွဲမှုနေရာ — လုပ်ငန်းလမ်းညွှန်",
      steps: [
        { icon:"1", color:"#e94560", title:"အော်ဒါလက်ခံပါ",           desc:"ဖောက်သည်ထံမှ အော်ဒါရလျှင် '+ မှာယူမှုအသစ်' တက်ဘ် ဖွင့်ပါ။" },
        { icon:"2", color:"#e94560", title:"အော်ဒါထည့်သွင်းပါ",       desc:"စားပွဲနံပါတ်နှင့် မာနူးရွေးချယ်ပြီး 'တင်သွင်း' နှိပ်ပါ။ နေရာတစ်ခုချင်းသို့ အလိုအလျောက် ညွှန်ကြားချက်ရောက်မည်။" },
        { icon:"3", color:"#e94560", title:"တိုးတက်မှုကြည့်ရှုပါ",    desc:"အော်ဒါစာရင်း တက်ဘ်တွင် လုပ်ဆောင်ချက်တစ်ခုချင်း၏ အခြေအနေကို အချိန်နှင့်တပြေးညီ ကြည့်ရှုနိုင်သည်။" },
        { icon:"4", color:"#e94560", title:"ကြိုတင်ပြင်ဆင်မှု စီမံပါ",desc:"ကြိုတင်ပြင်ဆင်မှု တက်ဘ်တွင် ဖွင့်ချိန်မတိုင်မီ ပြင်ဆင်မှုလုပ်ဆောင်ချက်များ မှတ်ပုံတင်ပြီး စီမံပါ။" },
        { icon:"5", color:"#e94560", title:"မှတ်တမ်းကြည့်ရှုပါ",      desc:"ပြီးဆုံးမှတ်တမ်း တက်ဘ်တွင် ဘယ်သူက ဘာကို ဘယ်အချိန် ပြီးဆုံးသည် မြင်နိုင်သည်။" },
        { icon:"6", color:"#e94560", title:"မာနူးမှတ်ပုံတင်ပါ",        desc:"မာနူးစီမံခန့်ခွဲမှု တက်ဘ်တွင် မာနူးနှင့် ချက်ပြုတ်မှုအဆင့်များ မှတ်ပုံတင်ပြင်ဆင်နိုင်သည်။" },
      ],
      tips: ["အော်ဒါပေးပို့ပြီးနောက် နေရာတစ်ခုချင်းသို့ အလိုအလျောက် ညွှန်ကြားချက်ရောက်မည်", "မှတ်တမ်းဖြင့် ယနေ့ လုပ်ဆောင်ချက်မှတ်တမ်းအားလုံး စစ်ဆေးနိုင်သည်"],
    },
    table: {
      title: "🪑 စားပွဲ မျက်နှာပြင် — အသုံးပြုနည်း",
      steps: [
        { icon:"1", color:"#7fb3ff", title:"စားပွဲနံပါတ်သတ်မှတ်ပါ",  desc:"ဤ tablet ၏ စားပွဲနံပါတ်သတ်မှတ်ပါ။" },
        { icon:"2", color:"#7fb3ff", title:"စောင့်ဆိုင်းနေ",          desc:"အော်ဒါမှာပြီးလျှင် 'ပြင်ဆင်နေ' သို့ ပြောင်းမည်။" },
        { icon:"3", color:"#7fb3ff", title:"ပြင်ဆင်နေ",               desc:"ဝန်ထမ်းများ ချက်ပြုတ်နေသည်။ ကျေးဇူးပြု၍ ခဏစောင့်ပါ။" },
        { icon:"4", color:"#7fb3ff", title:"အဆင်သင့်အကြောင်းကြား",  desc:"ဟင်းလျာအားလုံးအဆင်သင့်ဆိုလျှင် မျက်နှာပြင်တွင် အကြောင်းကြားမည်။" },
      ],
      tips: ["မျက်နှာပြင်တွင် နှိပ်ပြီး ဘာသာစကားပြောင်းနိုင်သည်"],
    },
  },
};

const TIPS_LABEL: Partial<Record<Language, string>> = {
  ja: "💡 ポイント",
  en: "💡 Tips",
  vi: "💡 Lưu ý",
  ne: "💡 सुझावहरू",
  id: "💡 Tips",
  my: "💡 အကြံပြုချက်",
  ur: "💡 تجاویز",
  th: "💡 เคล็ดลับ",
  zh: "💡 要点",
};

export default function WorkGuide({ station, language }: Props) {
  const guide = GUIDES[language]?.[station] ?? GUIDES.ja![station];
  const tipsLabel = TIPS_LABEL[language] ?? TIPS_LABEL.ja;

  return (
    <div style={styles.root}>
      <h2 style={styles.title}>{guide.title}</h2>

      <div style={styles.stepsWrap}>
        {guide.steps.map((step, i) => (
          <div key={i} style={styles.stepRow}>
            <div style={{ ...styles.stepNum, background: step.color }}>
              {step.icon}
            </div>
            <div style={styles.connector}>
              {i < guide.steps.length - 1 && <div style={styles.line} />}
            </div>
            <div style={styles.stepBody}>
              <div style={{ ...styles.stepTitle, color: step.color }}>{step.title}</div>
              <div style={styles.stepDesc}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {guide.tips.length > 0 && (
        <div style={styles.tipsBox}>
          <div style={styles.tipsTitle}>{tipsLabel}</div>
          {guide.tips.map((tip, i) => (
            <div key={i} style={styles.tip}>・{tip}</div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { paddingBottom: 32 },
  title: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#3d2010",
    marginBottom: 24,
  },
  stepsWrap: {
    display: "flex",
    flexDirection: "column",
  },
  stepRow: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  },
  stepNum: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "1rem",
    color: "#fff",
    flexShrink: 0,
    zIndex: 1,
  },
  connector: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 0,
    position: "relative" as const,
  },
  line: {
    position: "absolute" as const,
    top: 36,
    left: -18,
    width: 2,
    height: 48,
    background: "rgba(200,140,100,0.25)",
  },
  stepBody: {
    flex: 1,
    paddingBottom: 32,
  },
  stepTitle: {
    fontWeight: 700,
    fontSize: "1rem",
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: "0.9rem",
    color: "#7a6050",
    lineHeight: 1.6,
  },
  tipsBox: {
    background: "rgba(255,240,220,0.7)",
    border: "1px solid rgba(200,140,100,0.3)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontWeight: 700,
    color: "#c07040",
    marginBottom: 10,
    fontSize: "0.95rem",
  },
  tip: {
    fontSize: "0.88rem",
    color: "#8a6040",
    lineHeight: 1.8,
  },
};
