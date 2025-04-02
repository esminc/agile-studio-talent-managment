import * as React from "react";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, useNavigation, useActionData } from "react-router";
import { Progress } from "./ui/progress";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export type CSVImportDialogProps = {
  title: string;
  description: string;
  headers: {
    name: string;
    required: boolean;
  }[];
  maxProgressValue?: number;
};

export function CSVImportDialog({
  title,
  description,
  headers,
  maxProgressValue = 100,
}: CSVImportDialogProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigation = useNavigation();
  const actionData = useActionData();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name || null);
    setProgress(0);
  };

  React.useEffect(() => {
    if (navigation.state === "submitting") {
      setIsImporting(true);

      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 95)); // 95％まで進行（完了は結果表示と同時に）
      }, 300);

      return () => clearInterval(interval);
    } else if (navigation.state === "idle" && actionData && isImporting) {
      setProgress(100); // 完了時に100%に設定
      setIsImporting(false);
    }
  }, [navigation.state, actionData, isImporting]);

  return (
    <Dialog aria-label="CSV Import Dialog">
      <DialogTrigger asChild>
        <Button variant="outline">CSVからインポート</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{description}</DialogDescription>
        <Form method="post" encType="multipart/form-data">
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
                {headers.map((h) => h.name).join(",")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ※
                {headers
                  .filter((h) => h.required)
                  .map((h) => h.name)
                  .join(",")}
                は必須です
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {isImporting && (
              <div className="space-y-2">
                <Progress
                  value={progress}
                  max={maxProgressValue}
                  className="w-full"
                />
                <p className="text-xs text-center text-gray-500">
                  {progress < 100 ? "インポート中..." : "インポート完了"}
                </p>
              </div>
            )}
            <div className="flex justify-end">
              <DialogClose asChild>
                <Button type="submit" disabled={isImporting}>
                  インポート
                </Button>
              </DialogClose>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
