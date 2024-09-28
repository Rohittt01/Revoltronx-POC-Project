Overview
This project is an Express.js application designed to provide a unified search platform for users to access YouTube videos, articles, and academic papers. The goal was to streamline the research process by fetching and ranking results from multiple sources. The application integrates YouTube, Google Custom Search, and PubMed APIs, allowing users to retrieve diverse resources and present them in an organized manner on a results page.

Technologies Used
Express.js: For server-side routing and handling HTTP requests.
EJS (Embedded JavaScript): To dynamically render HTML pages.
Axios: For making API requests to YouTube, Google Custom Search, and PubMed.
Node.js: Backend framework used to handle server logic.
Environment Variables: To store and secure API keys.
YouTube Data API: For fetching video content and metadata.
Google Custom Search API: For fetching general web content.
PubMed API: For retrieving academic papers from PubMed's database.
Challenges Faced
Integrating Multiple APIs: Managing different API responses and formatting the data consistently was a challenge due to the different response structures of YouTube, Google Custom Search, and PubMed.
Ranking Results: Ranking YouTube videos based on views and likes, and sorting other content sources based on relevance required careful manipulation of API data.
API Rate Limits: Handling the rate limits imposed by YouTube and Google Custom Search while ensuring smooth performance was another hurdle.
PubMed API Integration: One of the hardest challenges was working with the PubMed API, specifically extracting the PMID (PubMed ID), which is crucial for accessing detailed academic papers. The process required careful parsing of the PubMed response format, as the PMID was not easily accessible in the initial responses. This took additional effort to identify the right structure within the API response and extract the necessary identifiers.
Approach and Management of Content Integration
Fetching Results: Each API was queried based on the user’s search input:

YouTube API returned videos with metadata like views and likes.
Google Custom Search provided general web content.
PubMed API fetched academic papers related to the search term.
Ranking YouTube Results: The fetched YouTube videos were ranked using a combination of the view count and the number of likes, ensuring the most relevant and popular videos appeared first. This was managed in the backend using simple array sorting.

Handling PubMed Data: The PubMed API was particularly tricky because the PMID (PubMed Identifier) required to link the academic papers was deeply nested within the response. I had to carefully navigate the JSON structure to extract this information. Once the PMID was retrieved, it was used to generate a link to the corresponding paper for display.

Data Rendering: After fetching and ranking the results, the data was passed to the EJS templates to dynamically render the search results on a dedicated results page, displaying them in a structured format.

Error Handling: Implemented basic error handling to manage API response failures and display appropriate messages to the user.