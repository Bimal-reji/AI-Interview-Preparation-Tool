import speech_recognition as sr

recognizer = sr.Recognizer()

def listen_from_mic():

    with sr.Microphone() as source:
        print("Listening...")

        recognizer.adjust_for_ambient_noise(source, duration=0.2)

        audio = recognizer.listen(source)

        try:
            text = recognizer.recognize_google(audio)
            return text.lower()

        except sr.UnknownValueError:
            return "Could not understand audio"

        except sr.RequestError as e:
            return f"Speech service error: {e}"