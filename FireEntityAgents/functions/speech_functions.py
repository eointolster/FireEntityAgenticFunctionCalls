# import whisper
# import numpy as np
# import scipy.signal
# from TTS.api import TTS
# import soundfile as sf
# import json

# # Initialize Whisper model
# whisper_model = whisper.load_model("base")

# # Initialize TTS
# tts = TTS(model_name="tts_models/en/jenny/jenny", progress_bar=False)

# def transcribe_audio(audio_file_path):
#     """Transcribe audio using Whisper"""
#     audio, sr = sf.read(audio_file_path)
    
#     # Resample to 16kHz if necessary
#     if sr != 16000:
#         audio = scipy.signal.resample_poly(audio, 16000, sr)
    
#     # Ensure audio is float32 and flattened
#     audio = audio.astype(np.float32).flatten()
    
#     # Transcribe using Whisper
#     result = whisper_model.transcribe(audio)
#     transcribed_text = result['text']
    
#     return transcribed_text

# def text_to_speech(text, output_file_path="temp_speech.wav"):
#     """Convert text to speech using TTS"""
#     tts.tts_to_file(text=text, file_path=output_file_path)
#     return output_file_path

# # Add schema for function manager
# transcribe_audio.schema = json.dumps({
#     "name": "transcribe_audio",
#     "description": "Transcribe audio file to text",
#     "parameters": {
#         "type": "object",
#         "properties": {
#             "audio_file_path": {"type": "string", "description": "Path to the audio file"}
#         },
#         "required": ["audio_file_path"]
#     }
# })

# text_to_speech.schema = json.dumps({
#     "name": "text_to_speech",
#     "description": "Convert text to speech",
#     "parameters": {
#         "type": "object",
#         "properties": {
#             "text": {"type": "string", "description": "Text to convert to speech"},
#             "output_file_path": {"type": "string", "description": "Path to save the output audio file"}
#         },
#         "required": ["text"]
#     }
# })