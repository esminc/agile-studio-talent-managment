import * as React from "react";
import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form } from "react-router";

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
};

export function CSVImportDialog({
  title,
  description,
  headers,
}: CSVImportDialogProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name || null);
  };

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
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button type="submit">インポート</Button>
            </DialogClose>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
