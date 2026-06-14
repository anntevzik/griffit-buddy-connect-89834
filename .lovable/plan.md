## მიზანი
დავამატოთ ფსიქოლოგიური ცოდნის ბაზა (ფერების მნიშვნელობები + პროფესიონალი ფსიქოლოგების მიერ გაანალიზებული ნახატების მაგალითები), რომელსაც AI გამოიყენებს ნახატის ანალიზისას — ანუ Gemini-ს მივცემთ "კონტექსტს" და ის ამის მიხედვით უპასუხებს, ნაცვლად ზოგადი ინტუიციისა.

## არქიტექტურა (RAG-სტილში, მარტივი)

```text
ბავშვი ხატავს → "Send to Parent"
        ↓
analyze-drawing edge function
        ↓
1. წამოიღოს color_meanings ბაზიდან ყველა ფერის წესი
2. წამოიღოს drawing_references ბაზიდან (ფსიქოლოგების მაგალითები)
3. ჩასვას ეს კონტექსტი Gemini-ს system prompt-ში
4. Gemini აანალიზებს ნახატს ამ ცოდნაზე დაყრდნობით
        ↓
შეინახე shared_drawings-ში → მშობელი ნახულობს
```

## ცვლილებები

### 1. ბაზის ცვლილებები (migration)
**ახალი ცხრილი `color_meanings`** — ფერების ფსიქოლოგიური მნიშვნელობები
- `color_name` (მაგ. "red", "blue")
- `hex_value` (მაგ. "#EF4444")
- `emotional_meaning` (მაგ. "ენერგია, გაბრაზება, აღელვება")
- `psychological_notes` (დეტალური ფსიქოლოგიური ახსნა აუტისტი ბავშვების კონტექსტში)

**ახალი ცხრილი `drawing_references`** — ფსიქოლოგების მიერ უკვე გაანალიზებული ნახატების მაგალითები
- `title` (მაგ. "სევდიანი ბავშვის ნახატი — წვიმა და მუქი ფერები")
- `description` (რა ხატია: ფერები, ფიგურები, კომპოზიცია)
- `professional_analysis` (ფსიქოლოგის სრული ანალიზი)
- `tags` (მაგ. `["sadness", "isolation", "dark_colors"]`)
- `source` (საიდან არის — წიგნი/კვლევა)

ორივე ცხრილი **public read** იქნება (ცოდნის ბაზა, არაა მგრძნობიარე), დაცული `service_role` write-ისთვის.

### 2. საწყისი მონაცემები (seed)
ჩავსვამ მზა მონაცემებს:
- **~12 ფერი** ცნობილი არტ-თერაპიის ლიტერატურიდან (Furth, Malchiodi, Cathy Malchiodi-ს "Understanding Children's Drawings")
- **~10-15 reference ნახატის ანალიზი** სხვადასხვა ემოციური მდგომარეობისთვის (სიხარული, შფოთვა, სევდა, რისხვა, სიმშვიდე, იზოლაცია, კრეატიულობა და ა.შ.) — ტექსტური აღწერებით (არა რეალური სურათები)

### 3. Edge function `analyze-drawing` განახლება
- ანალიზამდე წამოვიღოთ `color_meanings` და `drawing_references` ბაზიდან
- ავაგოთ გაფართოებული system prompt:
  ```
  KNOWLEDGE BASE — COLORS:
  - Red (#EF4444): {emotional_meaning} | {psychological_notes}
  - Blue (#3B82F6): ...
  
  REFERENCE ANALYSES BY PROFESSIONALS:
  1. "სევდიანი ბავშვის ნახატი": {professional_analysis}
  2. ...
  
  TASK: გაანალიზე ეს ნახატი ზემოთ მოცემული ცოდნის გამოყენებით.
  მონიშნე რომელ ფერებზე და რომელ მსგავს reference-ზე დააფუძნე დასკვნა.
  ```
- პასუხში დაამატოს `referenced_sources` მინიშნება (გამჭვირვალობისთვის)

### 4. (არასავალდებულო ბონუსი) მშობლის ხედი
`ChildDrawings.tsx`-ში პატარა badge "📚 Based on art-therapy knowledge base" — რომ მშობელმა იცოდეს ანალიზი არაა მხოლოდ ზოგადი AI ვარაუდი.

## ტექნიკური დეტალები
- ცხრილები: `color_meanings`, `drawing_references` — public schema, GRANT-ებით (`anon` + `authenticated` SELECT, `service_role` ALL)
- RLS: ორივეზე READ ყველასთვის (public knowledge), WRITE მხოლოდ `service_role`-ისთვის
- Seed data ჩაიდება `supabase--insert` ცალკე ნაბიჯად (არა მიგრაცია)
- Edge function-ის ცვლილება — Gemini 2.5 Flash რჩება, მაგრამ prompt გაიზრდება

## რა არ შედის ამ ეტაპზე
- რეალური ფსიქოლოგების ხელით ატვირთული ნახატების სურათები (მხოლოდ ტექსტური აღწერა)
- Vector embeddings / similarity search (მარტივი full-context inject ვაკეთებთ — საკმარისია 10-15 reference-ისთვის)
- Admin UI ცოდნის ბაზის სარედაქტირებლად (შემიძლია მერე დავამატო თუ გინდა)

დასტურის შემდეგ დავიწყებ მიგრაციით.
