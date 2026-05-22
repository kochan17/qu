#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path


PHRASE_REPLACEMENTS = [
    ("shif DIS C", "Shift_JIS"),
    ("shif デコード", "Shift_JIS"),
    ("シフト ジス", "Shift_JIS"),
    ("ユニコード", "Unicode"),
    ("文字 コード", "文字コード"),
    ("文字 化け", "文字化け"),
    ("基本 情報 技術 者 試験", "基本情報技術者試験"),
    ("情報 セキュリティ", "情報セキュリティ"),
    ("不正 アクセス 禁止 法", "不正アクセス禁止法"),
    ("サイバー セキュリティ 基本 法", "サイバーセキュリティ基本法"),
    ("個人 情報 保護 法", "個人情報保護法"),
    ("労働 基準 法", "労働基準法"),
    ("労働 者 派遣 契約", "労働者派遣契約"),
    ("受け 追い 契約", "請負契約"),
    ("受け おい", "請負"),
    ("受 追い", "請負"),
    ("式 命令", "指揮命令"),
    ("売上 減価", "売上原価"),
    ("売上 総 利益", "売上総利益"),
    ("営業 利益", "営業利益"),
    ("経常 利益", "経常利益"),
    ("特別 利益", "特別利益"),
    ("特別 損失", "特別損失"),
    ("減価 償却", "減価償却"),
    ("原価 償却", "減価償却"),
    ("減価 償却 費", "減価償却費"),
    ("取得 価格", "取得価格"),
    ("耐用 年数", "耐用年数"),
    ("対応 年数", "耐用年数"),
    ("先入れ 先出し 法", "先入先出法"),
    ("産業 財産 権", "産業財産権"),
    ("著作 権", "著作権"),
    ("著作 者 人格 権", "著作者人格権"),
    ("著作 財産 権", "著作財産権"),
    ("標準 化", "標準化"),
    ("国際 標準 化 機構", "国際標準化機構"),
    ("日本 産業 標準 調査 会", "日本産業標準調査会"),
    ("インターネット 技術 特別 調査 委員 会", "インターネット技術特別調査委員会"),
]

TOKEN_REPLACEMENTS = {
    "ビッ": "ビット",
    "ビットト": "ビット",
    "コンピューター ": "コンピューター",
    "受信 数": "10進数",
    "受信数": "10進数",
    "重 進数": "10進数",
    "重進数": "10進数",
    "10数": "10進数",
    "奇数 変換": "基数変換",
    "奇数変換": "基数変換",
    "奇数 は": "基数は",
    "奇数 を": "基数を",
    "奇数と重み": "基数と重み",
    "奇数は": "基数は",
    "奇数を": "基数を",
    "奇数": "基数",
    "警報": "刑法",
    "放棄": "法規",
    "主任 クラップ 契約": "シュリンクラップ契約",
    "主任クラップ契約": "シュリンクラップ契約",
    "シリン クラップ 契約": "シュリンクラップ契約",
    "シリンクラップ契約": "シュリンクラップ契約",
    "i E": "IEEE",
    "ietf": "IETF",
    "RF C": "RFC",
    "ジス": "JIS",
    "リゴ": "リンゴ",
    "規則先": "帰属先",
    "使命や成年月日": "氏名や生年月日",
    "感動され": "混同され",
    "丸暗期": "丸暗記",
    "向上的": "恒常的",
    "形状とは": "経常とは",
    "リアケース": "レアケース",
    "税引前当期準利益": "税引前当期純利益",
    "当期準利益": "当期純利益",
    "天才による損失": "天災による損失",
    "貸借対象表": "貸借対照表",
    "主力装置": "主記憶装置",
    "歳入可能": "再入可能",
    "再起": "再帰",
    "群数": "偶数",
    "1事件": "1次元",
    "事件配列": "次元配列",
    "呪術なぎ": "数珠つなぎ",
    "データをどのように成立させるか": "データをどのように整列させるか",
    "不美": "不備",
    "高等で": "口頭で",
    "高頭で": "口頭で",
    "車内ネットワーク": "社内ネットワーク",
    "噴出": "紛失",
    "パース": "PaaS",
    "戦友ネットワーク": "専用ネットワーク",
    "対応され": "貸与され",
    "客先上駐車": "客先常駐者",
    "客先上中": "客先常駐",
    "交番": "項番",
    "基地の脆弱性": "既知の脆弱性",
    "Fireウール": "ファイアウォール",
    "ご操作": "誤操作",
}

FILLERS = [
    "えー",
    "えっと",
    "あの",
    "まあ",
    "なんか",
    "ちょっと",
    "その",
]

HEADING_PATTERNS = [
    (r"こんにちは。本日[はも]([^。]{4,45})を勉強していきます。", r"## \1\n\n"),
    (r"こんにちは。このコースでは([^。]{4,45})を学習していきます。", r"## \1\n\n"),
    (r"本日は([^。]{4,45})を勉強していきます。", r"## \1\n\n"),
    (r"本日は([^。]{4,45})について学習をしていきます。", r"## \1\n\n"),
    (r"まず([^。]{4,30})についてです。", r"### \1\n\n"),
    (r"次に([^。]{4,30})について", r"### \1\n\n"),
    (r"最後に([^。]{4,30})について", r"### \1\n\n"),
]


def normalize_spaces(text: str) -> str:
    text = text.replace("\ufeff", "").replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t\n]+", " ", text).strip()

    for old, new in PHRASE_REPLACEMENTS:
        text = text.replace(old, new)

    # Join Japanese tokens split by ASR spaces.
    text = re.sub(r"(?<=[ぁ-んァ-ヶ一-龠]) (?=[ぁ-んァ-ヶ一-龠])", "", text)
    text = re.sub(r"(?<=[ぁ-んァ-ヶ一-龠]) (?=[A-Za-z0-9])", "", text)
    text = re.sub(r"(?<=[A-Za-z0-9]) (?=[ぁ-んァ-ヶ一-龠])", "", text)

    for old, new in TOKEN_REPLACEMENTS.items():
        text = text.replace(old, new)

    for filler in FILLERS:
        text = re.sub(rf"(^|[。！？、\s]){re.escape(filler)}(?=[、。！？\s])", r"\1", text)

    return text


def add_punctuation(text: str) -> str:
    sentence_starters = [
        "こんにちは",
        "本日は",
        "まず",
        "次に",
        "続いて",
        "最後に",
        "それでは",
        "例えば",
        "ちなみに",
        "なお",
        "補足ですが",
        "一方",
        "つまり",
        "よって",
        "このように",
        "ここからは",
        "ここまでで",
        "それぞれ",
        "試験では",
    ]
    for starter in sentence_starters:
        text = re.sub(rf"(?<![。！？\n])\s*{starter}", f"。{starter}", text)

    boundary_words = [
        "これまで",
        "頂いた",
        "最新の",
        "また",
        "各スライド",
        "講義資料",
        "興味がある方",
        "数万円",
        "詳しくは",
        "もし",
        "私たち",
        "コンピューター",
        "そもそも",
        "そのため",
        "そんなこと",
        "さらに",
        "この時",
        "2進数とは",
        "N進数とは",
        "16進数",
        "試験では",
        "ポイントは",
        "この問題",
        "問題文",
    ]
    endings = [
        "です",
        "ます",
        "ました",
        "ません",
        "ください",
        "しょう",
        "なります",
        "できます",
        "呼びます",
        "言えます",
        "分かります",
        "覚えてください",
    ]
    for ending in endings:
        for word in boundary_words:
            text = text.replace(f"{ending}{word}", f"{ending}。{word}")

    # Add punctuation after common sentence endings when followed by a new clause.
    for ending in endings:
        text = re.sub(rf"{ending} (?=[ぁ-んァ-ヶ一-龠A-Za-z0-9])", f"{ending}。", text)

    text = re.sub(r"([。！？])+", r"\1", text)
    text = re.sub(r"。([、,.])", "。", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def markdownize(text: str) -> str:
    text = add_punctuation(text)
    text = re.sub(r"こんにちはこのコースでは([^。]{4,45})を学習していきます。", r"## \1\n\n", text)
    text = re.sub(r"こんにちは本日[はも]([^。]{4,45})を(勉強|学習|説明)していきます。", r"## \1\n\n", text)
    text = re.sub(r"本日は([^。]{4,45})を(勉強|学習|説明)していきます。", r"## \1\n\n", text)
    text = re.sub(r"本日は([^。]{4,45})について学習をしていきます。", r"## \1\n\n", text)
    for pattern, replacement in HEADING_PATTERNS:
        text = re.sub(pattern, replacement, text)

    text = text.replace("それでは早速内容を見ていきましょう。", "")
    text = text.replace("それでは早速内容を見ていきます。", "")
    text = text.replace("動画を止めて考えてみてください。", "")
    text = text.replace("それ。では", "それでは")
    text = text.replace("。では", "では")
    text = text.replace("説明します", "")
    text = text.replace("メンバー の", "メンバーの")
    text = text.replace("A 3", "A3")
    text = text.replace("数万年の有料講座", "数万円の有料講座")
    text = text.replace("除いてみてください", "覗いてみてください")
    text = text.replace("学習しやすいよ合計", "学習しやすいよう、合計")
    text = text.replace("験の情報", "多くの情報")
    text = text.replace("各桁に1から9", "各桁に0から9")
    text = text.replace("10のくい", "10の位")
    text = text.replace("1のくい", "1の位")
    text = text.replace("1ぱ", "いっぱい")
    text = text.replace("参加表現", "3が表現")
    text = text.replace("リゴ", "リンゴ")
    text = text.replace("1010. という", "1010.001という")
    text = text.replace("8下1", "8×1")
    text = text.replace("4下0", "4×0")
    text = text.replace("2下1", "2×1")
    text = text.replace("64下1", "64×1")
    text = text.replace("8 3", "8×3")
    text = text.replace("1 7", "1×7")
    text = text.replace("0.25下2", "0.25×2")
    text = text.replace("0.5下2", "0.5×2")
    text = text.replace("0.625二", "0.625を2")
    text = text.replace("企画標準", "規格標準")
    text = text.replace("企画が", "規格が")
    text = text.replace("企画で", "規格で")
    text = text.replace("企画と", "規格と")
    text = text.replace("企画に", "規格に")
    text = text.replace("企画の", "規格の")
    text = text.replace("国家企画", "国家規格")
    text = text.replace("国際企画", "国際規格")
    text = text.replace("技術使用", "技術仕様")
    text = text.replace("法人税なんちゃら", "法人税等")
    text = text.replace("受け追い企業", "請負企業")
    text = text.replace("指示のも仕事", "指示の下で仕事")

    text = re.sub(r"(?<!\n)(##+ .+?)\n\n", r"\n\n\1\n\n", text)
    text = re.sub(r"。(?=(まず|次に|続いて|最後に|一方|例えば|ちなみに|なお|補足ですが|試験では))", "。\n\n", text)
    text = re.sub(r"。(?=## )", "\n\n", text)
    text = re.sub(r"([^。\n]{180,}。)", r"\1\n\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = text.strip()

    preface = (
        "# 完全解説（文字起こし整形版）\n\n"
        "> YouTube文字起こしを教材制作の参照用に一次整形したものです。"
        "公開教材へ転用する場合は、この本文をそのまま使わず、要約・再構成・出典確認を行ってください。\n\n"
    )
    return preface + text + "\n"


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: clean_transcript.py input.md output.md", file=sys.stderr)
        return 2

    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    text = src.read_text(encoding="utf-8")
    cleaned = markdownize(normalize_spaces(text))
    dst.write_text(cleaned, encoding="utf-8")
    print(f"wrote {dst} ({len(cleaned)} chars)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
