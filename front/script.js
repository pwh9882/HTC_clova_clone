let mediaRecorder;
let audioChunks = [];
let startTime;
let timerInterval;

document.getElementById('start-recording').addEventListener('click', startRecording);
document.getElementById('stop-recording').addEventListener('click', stopRecording);

async function startRecording() {
    document.getElementById('recording-status').innerHTML = '<span id="recording-dot" class="recording"></span> Recording...';
    document.getElementById('recording-dot').style.display = 'inline-block';

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstart = () => {
            document.getElementById('recording-status').innerHTML = '<span id="recording-dot" class="recording"></span> Recording...';
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioChunks = [];

            const formData = new FormData();
            formData.append('file', audioBlob, 'temp.wav');

            try {
                const response = await fetch('http://localhost:5000/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (data.transcript) {
                    document.getElementById('text-output').innerText = data.transcript;
                } else if (data.error) {
                    document.getElementById('recording-status').textContent = 'Error: ' + data.error;
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred');
            }
        };

        mediaRecorder.start();
        startTime = new Date();
        startTimer();
    } catch (error) {
        console.error('Error accessing audio devices:', error);
        alert('Error accessing audio devices');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        stopTimer();
        document.getElementById('recording-status').innerHTML = 'Ready to record...';
        document.getElementById('recording-dot').style.display = 'none';
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        const now = new Date();
        const elapsedTime = new Date(now - startTime);
        const hours = String(elapsedTime.getUTCHours()).padStart(2, '0');
        const minutes = String(elapsedTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(elapsedTime.getUTCSeconds()).padStart(2, '0');
        document.getElementById('time-elapsed').textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    document.getElementById('time-elapsed').textContent = '00:00:00';
}
