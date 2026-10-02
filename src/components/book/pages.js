import backCover from "../../assets/book/book-back.jpg";
import cover from "../../assets/book/book-cover.jpg";

// Page images, auto-discovered and sorted by filename.
const photoFiles = import.meta.glob("../../assets/book-pages/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});

// Vite can hand back either a URL string or a module namespace object.
const toUrl = (value) => (typeof value === "string" ? value : value?.default);

const photos = Object.keys(photoFiles)
  .sort()
  .map((key) => toUrl(photoFiles[key]));

/* One flip sheet has two faces (front + back), so it needs two distinct
   photos - otherwise every image shows up on two sheets at once.
   The first sheet opens on the cover artwork and the last one closes on the
   back cover, which costs two face slots that are not photos:

       photos = 2 * sheets - 2        sheets = (photos + 2) / 2

   With 22 photos that is 12 sheets: Cover + Page 1..11 + Back Cover.
   Adding or removing photos in src/assets/book-pages/ needs no code change -
   only zero-padded filenames (page-01, page-02, ...) so sort() stays correct. */
const middle = photos.slice(1, -1);
const sheets = [];
for (let i = 0; i + 1 < middle.length; i += 2) {
  sheets.push({ front: middle[i], back: middle[i + 1] });
}

export const pages = [
  { front: cover, back: photos[0] },
  ...sheets,
  { front: photos[photos.length - 1], back: backCover },
];