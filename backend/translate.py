"""
多言語自動翻訳ユーティリティ
Google Translate の非公式 API (gtx) を使用して日本語テキストを各言語に翻訳する。
"""
import json
import asyncio
import httpx

# サポート言語とGoogleの言語コード
LANG_MAP = {
    "en": "en",
    "vi": "vi",
    "ne": "ne",
    "id": "id",
    "my": "my",
}

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=10.0)
    return _client


async def _translate_one(text: str, target_lang: str) -> str:
    """Google Translate gtx エンドポイントで1言語翻訳"""
    try:
        client = _get_client()
        resp = await client.get(
            "https://translate.googleapis.com/translate_a/single",
            params={
                "client": "gtx",
                "sl": "ja",
                "tl": target_lang,
                "dt": "t",
                "q": text,
            },
            headers={"User-Agent": "Mozilla/5.0"},
        )
        resp.raise_for_status()
        data = resp.json()
        # レスポンス: [[["翻訳テキスト", "原文", ...], ...], ...]
        parts = data[0]
        translated = "".join(p[0] for p in parts if p and p[0])
        return translated.strip() if translated else text
    except Exception:
        return text  # 翻訳失敗時は元の日本語を返す


async def translate_all_languages(ja_text: str) -> dict:
    """日本語テキストを全対応言語に翻訳して辞書で返す"""
    results = {"ja": ja_text}
    tasks = {lang: _translate_one(ja_text, google_code)
             for lang, google_code in LANG_MAP.items()}
    translations = await asyncio.gather(*tasks.values(), return_exceptions=True)
    for (lang, _), result in zip(tasks.items(), translations):
        if isinstance(result, Exception):
            results[lang] = ja_text
        else:
            results[lang] = result
    return results


def is_multilingual_json(text: str) -> bool:
    """既にJSON多言語形式かどうか判定"""
    try:
        parsed = json.loads(text)
        return isinstance(parsed, dict) and "ja" in parsed
    except Exception:
        return False


async def ensure_multilingual(description: str) -> str:
    """
    descriptionがすでにJSON多言語形式なら何もしない。
    日本語プレーンテキストなら翻訳してJSON文字列で返す。
    """
    if not description:
        return description
    if is_multilingual_json(description):
        return description
    translations = await translate_all_languages(description)
    return json.dumps(translations, ensure_ascii=False)
