// 제공해주신 기본 설정 유지
const URL = "./my_model/";

let model, labelContainer, maxPredictions;

// 모델 로드 함수
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    
    if (!model) {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }
}

// 사진이 업로드되었을 때 실행되는 함수
async function predictImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        // 1. UI 준비
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

            // 2. 모델 로드 및 예측
            try {
                await loadModel();
                const prediction = await model.predict(preview);
                
                // 정렬 (확률 높은 순)
                prediction.sort((a, b) => b.probability - a.probability);
                
                // 3. 결과 표시
                spinner.style.display = 'none';
                displayResults(prediction);
                document.querySelector('.retry-btn').style.display = 'block';
                
            } catch (error) {
                console.error(error);
                alert("모델 로드에 실패했습니다. my_model 폴더를 확인해주세요.");
                location.reload();
            }
        };

        reader.readAsDataURL(input.files[0]);
    }
}

// 결과를 프로그레스 바 형태로 표시
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
        
        // 애니메이션 효과를 위해 딜레이 후 가로 길이 설정
        setTimeout(() => {
            wrapper.querySelector('.bar-fill').style.width = percent + '%';
        }, 100);
    }
}