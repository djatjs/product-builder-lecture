let model, maxPredictions;

// 모델 로드 함수 (입력된 URL 사용)
async function loadModel(url) {
    const modelURL = url + "model.json";
    const metadataURL = url + "metadata.json";
    
    // 새로 입력된 URL이 있을 경우에만 로드
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

// 사진이 업로드되었을 때 실행되는 함수
async function predictImage(input) {
    const urlInput = document.getElementById('model-url').value.trim();
    
    if (!urlInput) {
        alert("Teachable Machine 모델 공유 링크를 먼저 입력해주세요!");
        input.value = ""; // 파일 선택 초기화
        return;
    }

    // URL 형식 보정 (끝에 /가 없으면 추가)
    const formattedURL = urlInput.endsWith('/') ? urlInput : urlInput + '/';

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        // UI 업데이트
        document.getElementById('upload-label').style.display = 'none';
        const preview = document.getElementById('preview-image');
        const resultSection = document.getElementById('result-section');
        const spinner = document.getElementById('loading-spinner');
        const labelContainer = document.getElementById('label-container');
        
        resultSection.style.display = 'block';
        spinner.style.display = 'block';
        labelContainer.innerHTML = '';
        
        reader.onload = async function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';

            try {
                // 입력된 클라우드 URL로부터 모델 로드
                await loadModel(formattedURL);
                
                // 예측 수행
                const prediction = await model.predict(preview);
                
                // 확률순 정렬
                prediction.sort((a, b) => b.probability - a.probability);
                
                spinner.style.display = 'none';
                displayResults(prediction);
                document.querySelector('.retry-btn').style.display = 'block';
                
            } catch (error) {
                console.error(error);
                alert("모델을 불러오지 못했습니다. 링크가 올바른지 확인해주세요.");
                spinner.style.display = 'none';
                document.getElementById('upload-label').style.display = 'block';
                preview.style.display = 'none';
            }
        };

        reader.readAsDataURL(input.files[0]);
    }
}

function displayResults(prediction) {
    const labelContainer = document.getElementById('label-container');
    
    for (let i = 0; i < maxPredictions; i++) {
        const percent = (prediction[i].probability * 100).toFixed(0);
        const className = prediction[i].className;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'result-bar-wrapper';
        
        wrapper.innerHTML = `
            <div class="bar-label">
                <span>${className}</span>
                <span>${percent}%</span>
            </div>
            <div class="bar-bg">
                <div class="bar-fill" style="width: 0%"></div>
            </div>
        `;
        
        labelContainer.appendChild(wrapper);
        
        setTimeout(() => {
            wrapper.querySelector('.bar-fill').style.width = percent + '%';
        }, 100);
    }
}