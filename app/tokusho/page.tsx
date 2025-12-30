export default function TokushoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-sm leading-7 text-zinc-900">
      <h1 className="mb-8 text-xl font-semibold">
        特定商取引法に基づく表記
      </h1>

      <dl className="space-y-4">
        <div>
          <dt className="font-medium">販売事業者名</dt>
          <dd>Trustfolio LLC</dd>
        </div>

        <div>
          <dt className="font-medium">運営責任者</dt>
          <dd>Hideki Nagashima</dd>
        </div>

        <div>
          <dt className="font-medium">所在地</dt>
          <dd>
            3F-B, Imasu Nishi-Shinjuku Daiichi Bldg., 3-9-2 Nishi-Shinjuku,
            Shinjuku-ku, Tokyo, Japan
          </dd>
        </div>

        <div>
          <dt className="font-medium">電話番号</dt>
          <dd>請求があった場合には遅滞なく開示いたします。</dd>
        </div>

        <div>
          <dt className="font-medium">メールアドレス</dt>
          <dd>support@aifactoryai.com</dd>
        </div>

        <div>
          <dt className="font-medium">販売価格</dt>
          <dd>各サービスページに記載の金額（税込）</dd>
        </div>

        <div>
          <dt className="font-medium">商品代金以外の必要料金</dt>
          <dd>
            インターネット接続料金、通信料金等はお客様のご負担となります。
          </dd>
        </div>

        <div>
          <dt className="font-medium">お支払い方法</dt>
          <dd>クレジットカード決済（Stripe）</dd>
        </div>

        <div>
          <dt className="font-medium">支払時期</dt>
          <dd>
            クレジットカード決済の場合、各カード会社引き落とし日に準じます。
          </dd>
        </div>

        <div>
          <dt className="font-medium">商品の引渡時期</dt>
          <dd>決済完了後、直ちにご利用いただけます。</dd>
        </div>

        <div>
          <dt className="font-medium">返品・キャンセルについて</dt>
          <dd>
            デジタルサービスの性質上、提供開始後の返金・キャンセルには原則として応じておりません。
            <br />
            ただし、当社が提供するサービスに重大な不具合がある場合は、個別に対応いたします。
          </dd>
        </div>

        <div>
          <dt className="font-medium">動作環境</dt>
          <dd>
            最新のWebブラウザ（Google Chrome、Safari 等）を推奨します。
          </dd>
        </div>
      </dl>
    </main>
  );
}
