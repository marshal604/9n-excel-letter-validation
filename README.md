# 9n Excel Letter Validation

Excel 儲存格驗證工具，用於比對兩個 Excel 檔案的內容。

## 用途

驗證 Reference 檔案中的所有儲存格值是否都存在於 Source 檔案中。

- **Source 檔案**：包含所有合法/正確的值
- **Reference 檔案**：需要被驗證的檔案

如果 Reference 中有任何值不存在於 Source 中，這些無效的值會被列出並以 a-z 順序排列顯示。

## 使用情境

- 驗證翻譯檔案中的用詞是否符合術語表
- 檢查資料匯入前的值是否在允許清單中
- 比對兩份清單找出差異項目

## 安裝

```bash
npm install
```

## 開發

```bash
npm run dev
```

## 建置

```bash
npm run build
```

## 使用方式

1. 上傳 Source 檔案（包含所有合法值的 Excel）
2. 上傳 Reference 檔案（需要驗證的 Excel）
3. 點擊 Compare 按鈕
4. 查看驗證結果：
   - 綠色訊息：所有值都合法
   - 紅色訊息：顯示不在 Source 中的無效值
