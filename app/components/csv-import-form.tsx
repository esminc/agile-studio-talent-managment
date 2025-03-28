import * as React from "react";
import { useRef, useState } from "react";
import { parse } from "csv-parse/browser/esm";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CSVImportFormProps {
  onSuccess: (results: { success: number; errors: string[] }) => void;
  onError: (error: string) => void;
}

export function CSVImportForm({ onSuccess, onError }: CSVImportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name || null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fileInputRef.current?.files?.[0]) {
      return;
    }

    setIsSubmitting(true);

    try {
      const file = fileInputRef.current.files[0];
      const text = await file.text();

      // CSVをパース
      parse(
        text,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        },
        (err) => {
          if (err) {
            onError(`CSVのパースに失敗しました: ${err.message}`);
            setIsSubmitting(false);
            return;
          }

          // FormDataを作成してサーバーに送信
          const formData = new FormData();
          formData.append("csvFile", file);

          fetch("/accounts", {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.error) {
                onError(data.error);
              } else if (data.results) {
                onSuccess(data.results);

                // フォームをリセット
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                setFileName(null);
              }
            })
            .catch((error) => {
              onError(error instanceof Error ? error.message : "不明なエラー");
            })
            .finally(() => {
              setIsSubmitting(false);
            });
        },
      );
    } catch (error) {
      onError(error instanceof Error ? error.message : "不明なエラー");
      setIsSubmitting(false);
    }
  };

  return (
    <form method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="csvFile" className="text-sm font-medium">
            CSVファイル
          </label>
          <Input
            id="csvFile"
            name="csvFile"
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            required
          />
          {fileName && (
            <p className="text-sm text-gray-500">
              選択されたファイル: {fileName}
            </p>
          )}
        </div>
        <div className="mb-2">
          <p className="text-sm text-gray-500">
            CSVファイルには、以下のヘッダーを含めてください:
          </p>
          <p className="text-xs text-gray-500 mt-1">
            name,email,photo,organizationLine,residence
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ※ name、email、organizationLine、residenceは必須です
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !fileName}>
          {isSubmitting ? "インポート中..." : "インポート"}
        </Button>
      </div>
    </form>
  );
}
