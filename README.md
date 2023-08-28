## av5ja

av5jaはSplatNet3のAPIに対応した非同期通信ライブラリです.

> 本ライブラリは任天堂株式会社の著作物を一切含んでおりません.

### 導入

> 現在執筆中です.


### 機能

- [ ] ログイン
- [ ] データ取得

## スクリプト

以下のスクリプトに対応しています。

- `dev`
  - tscでindex.tsを実行します
  - 特に使う場面はありません
- `build`
  - tscでビルドを行います
  - 特に使う場面はありません
- `format`
  - prettierを使ってコード整形を行います
  - 未整形のコードが残っている場合はCIが失敗します
- `lint`
  - eslintを使ってコードのチェックを行います
  - エラーが発生した場合はCIが失敗します
- `test`
  - jestでテストを実行します
  - テストが通らない場合CIが失敗します
  - プッシュ前にテストが通るかどうかをチェックしてください
 
## リリース

GitHubのPersonal Access Tokenが必要です.

このとき権限として, `repo`, `write:packages`, `read:packages`を付与しておいてください.

### GitHub Actionsを利用する場合(推奨)

`master`ブランチに`v*.*.*`を満たすタグをプッシュしてください.

バージョンが被っているとリリースに失敗するので`package.json`のバージョンをアップデートしてください.

ビルドとリリースは自動で行われます.

### npmを利用する方法

```
npm login --registry=https://npm.pkg.github.com
```

パスワードが要求されますが、Personal Access Tokenを入力してください.

```
npm publish --dry-run
```

> 実際にリリースする場合は`--dry-run`を外してください

### actを利用する方法

actを利用するにはDockerが必要です.

```
cp .secrets.example .secrets
```

`.secrets`ファイルにGitHubのPersonal Access Tokenを貼り付けます.
```
act --secret-file .secrets -j cd
```

## ローカルCI

ローカルでCIを実行してGitHub Actionsをパスするかを確かめることができます. 無意味にプッシュしてGitHub Actionsのクレジットを消費しないようにしてください.

### actを利用する方法(推奨)

以下のコマンドでGitHub Actionsに代わってローカルでCIが実行できます.

```
act --secret-file .secrets -j ci
```

### 手動でコマンドを入力する方法

以下のコマンドを実行して何も警告がでなければOKです.

```
yarn format
yarn lint
yarn test
```

### GitHub Actionsを利用する方法

いずれかのブランチにプッシュすると自動でCIが実行されます.

## 貢献者

- @tkgstrator
