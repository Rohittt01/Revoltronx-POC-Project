const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv").config();
const app = express();
const PORT = 3000;

// Use EJS as the templating engine
app.set("view engine", "ejs");

// Serve static files (CSS, JS, images)
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

// Route to handle search functionality
app.get("/search", async (req, res) => {
  const searchTerm = req.query.term;

  try {
    // Fetch YouTube videos
    const youtubeResults = await fetchYouTubeResults(searchTerm);

    // Fetch articles
    const articlesResults = await fetchArticles(searchTerm);

    const academicResults = await fetchPaperLinksAndTitles("sports");

    // Render the results, passing the resolved papers array
    res.render("results", {
      youtube: youtubeResults,
      articles: articlesResults,
      papers: academicResults, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching search results");
  }
});

// YouTube API Integration
async function fetchYouTubeResults(searchTerm) {
  try {
    const API_KEY = process.env.CUSTOM_SEARCH_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${searchTerm}&type=video&key=${API_KEY}`;

    const response = await axios.get(url);

    const videoIds = response.data.items
      .map((item) => item.id.videoId)
      .join(",");

    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${API_KEY}`;
    const statsResponse = await axios.get(statsUrl);
    const statsData = statsResponse.data.items;

    const videos = response.data.items.map((item, index) => ({
      title: item.snippet.title,
      link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      views: Number(statsData[index]?.statistics?.viewCount) || "N/A",
      likes: Number(statsData[index]?.statistics?.likeCount) || "N/A",
    }));

    videos.sort((a, b) => {
      if (b.views !== a.views) {
        return b.views - a.views; // Sort by views descending
      }
      return b.likes - a.likes; // Sort by likes descending
    });
    console.log(videos);
    return videos;
  } catch (error) {
    console.error(
      "Error fetching video data:",
      error.response ? error.response.data : error.message
    );
  }
}

// Google Custom Search API Integration (for articles and blogs)
async function fetchArticles(searchTerm) {
  try {
    const API_KEY = process.env.CUSTOM_SEARCH_API_KEY;
    const CX = process.env.CUSTOM_SEARCH_ENGINE_ID;
    const url = `https://www.googleapis.com/customsearch/v1?q=${searchTerm}&key=${API_KEY}&cx=${CX}&num=5`;

    const response = await axios.get(url);
    const articles = response.data.items.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));

    return articles;
  } catch (error) {
    console.error(
      "Error fetching articles:",
      error.response ? error.response.data : error.message
    );
    return []; // Return an empty array on error
  }
}


const fetchPaperLinksAndTitles = async (searchTerm) => {
  const baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/";
  const db = "pubmed";
  const apiKey = process.env.CUSTOM_PUBMED_API_KEY; // Replace with your NCBI API Key (optional)

  try {
    // Step 1: Perform the search query to get PMIDs
    const searchUrl = `${baseUrl}esearch.fcgi?db=${db}&term=${encodeURIComponent(
      searchTerm
    )}&retmode=xml&api_key=${apiKey}`;
    const searchResponse = await axios.get(searchUrl);

    if (searchResponse.status !== 200) {
      throw new Error(`Error fetching data: ${searchResponse.status}`);
    }

    // Step 2: Extract PMIDs from the search response
    const pmids = searchResponse.data
      .split("<Id>")
      .slice(1)
      .map((id) => id.split("</Id>")[0]);

    // Step 3: Use the PMIDs to fetch detailed information
    const fetchUrl = `${baseUrl}efetch.fcgi?db=${db}&id=${pmids.join(
      ","
    )}&retmode=xml&api_key=${apiKey}`;
    const fetchResponse = await axios.get(fetchUrl);

    // Check if the fetch request was successful
    if (fetchResponse.status !== 200) {
      throw new Error(`Error fetching data: ${fetchResponse.status}`);
    }

    // Step 4: Extract titles and links from the fetched articles
   const papers = fetchResponse.data
     .split("<PubmedArticle>")
     .slice(1)
     .map((article) => {
       const title =
         article.split("<ArticleTitle>")[1]?.split("</ArticleTitle>")[0] ||
         "No title available";
       const pmid = article.split("<PMID>")[1]?.split("</PMID>")[0];

       // Construct the link with error handling
       const link = pmid
         ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}`
         : "PMID not found";

       return {
         title,
         link,
       };
     })
     .slice(0, 10); // Limit to the first 10 papers

   console.log(papers);
   return papers;
  } catch (error) {
    console.error("Error fetching papers:", error.message);
    throw error;
  }
};
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
