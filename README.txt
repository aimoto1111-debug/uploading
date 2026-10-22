こもれびゲーム館（更新ボタンで反映できる版）

■ 中身
public/index.html                サイト本体（管理ページ入り）
netlify/functions/site.mjs       サイトの内容と画像を保存するサーバー機能
package.json / netlify.toml      Netlify の設定

■ 置き方（GitHub 経由。パソコンに何も入れなくてよい方法）
1. GitHub にログインし、右上の「＋」→「New repository」で空のリポジトリを作る（名前は自由、Private でよい）。
2. できたリポジトリの画面で「uploading an existing file」を押し、
   この ZIP を展開した中身（public、netlify フォルダ、package.json、netlify.toml、README.txt）をまとめてドラッグして「Commit changes」。
3. Netlify にログインし、「Add new project」→「Import an existing project」→「GitHub」→ 作ったリポジトリを選んで「Deploy」。
   設定は netlify.toml から自動で読みこまれるので、何も変えなくてよい。
4. 公開された URL を開き、いちばん下の「管理ページ」から 6570 で入る。
   追加や編集のあと「更新する」を押せば、そのまま全員に反映される。

※ いまの Netlify のサイト（ドラッグ＆ドロップで置いたもの）を使い続けたい場合は、
   そのサイトの「Project configuration」→「Build & deploy」→「Link repository」で、上のリポジトリをつなげても同じになる。

■ パスワードを変えたいとき
Netlify の「Project configuration」→「Environment variables」で ADMIN_PIN を追加し、好きな数字を入れて、もう一度デプロイする。
（何も設定しなければ 6570）

■ 注意
・ドラッグ＆ドロップだけで置くと、サーバー機能が動かないため「更新する」ボタンは出ず、従来の「下書き保存」と「書き出し」になる。
・写真は Netlify Blobs に保存される。一覧から消したゲームの写真は、次の「更新する」のときに自動で片づく。
