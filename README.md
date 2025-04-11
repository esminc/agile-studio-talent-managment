# Agile Studio Talent Management System

Devinを導入して作成したWebアプリケーション（Agile Studio のタレントマネジメントシステム）のリポジトリです。

[AIプログラマー「Devin」と挑む新たな開発の可能性 ～ アジャイル開発との親和性](https://www.agile-studio.jp/post/challenge-new-development-with-devin) で紹介しています。

## プロジェクト概要

Agile Studio のメンバーのスキルや経験、プロジェクトアサイン状況などを管理するためのシステムです。React Router と AWS Amplify を使用して構築されています。

## 開発環境セットアップ

### 1. 依存関係のインストール

プロジェクトのルートディレクトリで以下のコマンドを実行し、必要なパッケージをインストールします。

```bash
npm install
```

### 2. 開発サーバーの起動

以下のコマンドで開発サーバーを起動します。ホットリロードが有効になります。

```bash
npm run dev
```

アプリケーションは `http://localhost:5173` で利用可能になります。

## ビルド

本番用のビルドを作成するには、以下のコマンドを実行します。

```bash
npm run build
```

ビルド成果物は `build/` ディレクトリに出力されますが、Amplify Hosting でのデプロイ時には `amplify.yml` の設定に基づいて自動的にビルドが行われます。

## デプロイ (AWS Amplify Hosting)

このプロジェクトは AWS Amplify Hosting でのデプロイが推奨されます。

1.  **AWS Amplify Console にアクセス:** AWS マネジメントコンソールから Amplify Console を開きます。
2.  **新しいアプリを作成:** 「ウェブアプリをホスト」を選択し、アプリ作成プロセスを開始します。
3.  **リポジトリを接続:** このプロジェクトのリポジトリ（例: GitHub, GitLab, Bitbucket）を Amplify に接続します。
4.  **ブランチを選択:** デプロイしたいブランチを選択します。
5.  **ビルド設定の確認:** Amplify はリポジトリ内の `amplify.yml` を自動的に検出し、ビルド設定を構成します。通常、追加の設定は不要です。
6.  **デプロイ:** 設定を確認し、デプロイを開始します。

デプロイが完了すると、Amplify によって提供される URL でアプリケーションにアクセスできるようになります。CI/CD パイプラインも自動的に設定され、選択したブランチへのプッシュをトリガーに自動でビルドとデプロイが実行されます。

---

Built with ❤️ using React Router and AWS Amplify.
