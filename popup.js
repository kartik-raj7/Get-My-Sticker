const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');
const results = document.getElementById('results');

console.log('Script loaded, elements should be available now');

searchButton.addEventListener('click', () => {
  const query = searchBar.value.trim();
  if (query) {
    fetchResults(query);
  }
});

function fetchResults(query) {
  results.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'result-item skeleton';
    results.appendChild(skeleton);
  }
const formdata = new FormData();
  formdata.append("q", query);
  const tenorRequestOptions = {
    method: 'POST',
    body: formdata,
    redirect: 'follow'
  };
  Promise.all([
    fetch(giphyUrl).then(response => response.json()),
    fetch(tenorUrl, tenorRequestOptions).then(response => response.json())
  ])
  .then(([giphyData, tenorData]) => {
    const allItems = [...giphyData.data, ...tenorData.results];
      displayResults(allItems);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    // results.innerHTML = <p>Error fetching data.</p>;
  });
}
function displayResults(items, type) {
  results.innerHTML = '';
  console.log(items);
  if (Array.isArray(items) && items.length > 0) {
    items.forEach(item => {
      const resultItem = document.createElement('div');
      resultItem.className = 'result-item';
      console.log(item);
      const mediaUrl = item.images ? item.images.fixed_height.url : item?.media[0]?.tinygif?.url;
      const img = document.createElement('img');
      img.src = mediaUrl;
      img.alt = type;

      // Create share button
      // const shareButton = document.createElement('button');
      // shareButton.className = 'sharebutton';
      // shareButton.innerText = 'Share on WhatsApp';
      // shareButton.onclick = () => {
      //   shareMedia(mediaUrl);
      // };

      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'copybutton';
      copyButton.innerHTML = '<i class="fas fa-copy"></i>'; // Font Awesome copy icon
      copyButton.onclick = () => {
        copyImage(mediaUrl);
      };
      
      // Create the download button with an icon
      const downloadButton = document.createElement('button');
      downloadButton.className = 'downloadbutton';
      downloadButton.innerHTML = '<i class="fas fa-download"></i>'; // Font Awesome download icon
      downloadButton.onclick = () => {
        downloadAndShareMedia(mediaUrl);
      };
      function shareMedia(mediaUrl) {
        if (navigator.share) {
          navigator.share({
            title: 'Check out this media!',
            url: mediaUrl,
          })
          .then(() => console.log('Thanks for sharing!'))
          .catch(error => console.error('Error sharing:', error));
        } else {
          // Fallback for browsers that do not support the Web Share API
          const shareUrl = `https://wa.me/?text=${encodeURIComponent(mediaUrl)}`;
          window.open(shareUrl, '_blank');
        }
      }
      function downloadAndShareMedia(mediaUrl) {
        console.log(mediaUrl)
        downloadMedia(mediaUrl)
      }
      const  downloadMedia = async (mediaUrl) => {
        let a = document.createElement('a');
        let response = await fetch(mediaUrl);
        let file = await response.blob();
        a.download = 'myGif';
        a.href = window.URL.createObjectURL(file);
        a.dataset.downloadurl = ['application/octet-stream', a.download, a.href].join(':');
        // toastr.success('Downloaded successfully!');
        a.click();
        window.URL.revokeObjectURL(a.href);
      }
      async function copyImage(imgUrl) {
        try {
          const response = await fetch(imgUrl);
          const blob = await response.blob();
          const img = document.createElement('img');
          img.src = URL.createObjectURL(blob);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (blob) => {
              await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
              ]);
              // toastr.success('Image copied successfully!');
              console.log('image')
            }, 'image/png');
          };
          
        } catch (err) {
          console.error('Error copying image:', err);
        }
      }
      // Append elements to result item
      resultItem.appendChild(img);
      // resultItem.appendChild(shareButton);
      // resultItem.appendChild(copyButton);
      // resultItem.appendChild(downloadButton)
      const container = document.createElement('div');
container.className = 'button-container';
container.appendChild(copyButton);
container.appendChild(downloadButton);

resultItem.appendChild(container);
      results.appendChild(resultItem);
    });
  } else {
    results.innerHTML = `<p>No ${type}s found.</p>`;
  }
}