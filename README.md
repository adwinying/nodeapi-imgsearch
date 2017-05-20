# FCC API: Image Search Abstraction Layer

## Summary
Takes in an image search query and returns the results in JSON.

## APIs

```/search/[query]```

Search query. Required.

#### Example
```http://imgsearch.nodejs.iadw.in/search/dank%20memes```

---

```/search/[query]?offset=[num]```

Shows page `[num]` of search result.

#### Example
```http://imgsearch.nodejs.iadw.in/search/dank%20memes?offset=2```


## Sample Output
```javascript
{
  url: "http://i2.kym-cdn.com/photos/images/facebook/000/875/509/533.jpg",
  snippet: "Dank Memes | Know Your Meme",
  thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqWgok3w_ebpzXZzr5rWGCFQUsomgyep1hG8sShx7vvHj0uW0SCwdvYyk",
  context: "http://knowyourmeme.com/memes/dank-memes"
}
```