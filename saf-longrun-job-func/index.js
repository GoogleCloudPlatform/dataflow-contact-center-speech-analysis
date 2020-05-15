/**
 * Copyright 2020, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// import modules
const PubSub = require(`@google-cloud/pubsub`);
const storage = require('@google-cloud/storage')();
const speech = require('@google-cloud/speech').v1p1beta1;
const client = new speech.SpeechClient();
const uniqid = require('uniqid');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

exports.safLongRunJobFunc = (event, context, callback) => {
	const file = event;
	const topicName = file.metadata.pubsubtopicname;
	const audioPath = { uri: `gs://${file.bucket}/${file.name}` };
	const readFile = storage.bucket(file.bucket).file(file.name);

	const remoteReadStream = async () => {
		try {
			const res = readFile.createReadStream();
			return res;
		} catch (err) {
			console.error(err);
		};
	};

	function getAudioMetadata(path) {
		// check if file is a wav or flac audio file
		return new Promise((res, rej) => {
			ffmpeg.ffprobe(path, (err, metadata) => {
				if (err) return rej(err);
				const audioMetaData = require('util').inspect(metadata, false, null);
				if (!audioMetaData) throw new Error('Cannot find metadata of ' + path)
				return res(audioMetaData);
			});
		});
	};

	remoteReadStream().then(resRemoteReadStream => {
		getAudioMetadata(resRemoteReadStream).then(res => {

			resRemoteReadStream.destroy();

			// start cleanup - fluent-ffmpeg has an dirtyJSON output
			let resString = res.replace(/[&\/\\#+()$~%'"*?<>{}\s\n\]\[]/g, ''); // remove listed characters
			resString = resString.replace(/:/g, ','); // replace semicolon with commas
			let resArray = resString.split(','); // split string on commas
			// end cleanup

			let sampleRate = resArray[resArray.indexOf('sample_rate') + 1];
			let channels = resArray[resArray.indexOf('channels') + 1];
			let bitsPerSample = resArray[resArray.indexOf('bits_per_sample') + 1];

			// check if file is a wav or flac audio file
			let iExt = file.name.lastIndexOf('.');
			let ext = (iExt < 0) ? '' : file.name.substr(iExt);
			let duration;
			if (ext === '.wav') {
				duration = (file.size / (sampleRate * channels * (bitsPerSample / 8))) / 60;
			}
			else if (ext === '.flac') {
				duration = resArray[resArray.indexOf('duration') + 1];
			}

			let audioConfig = {};

			// check for stero or mono in metadata
			if (file.metadata.stereo === 'true') {
				audioConfig = {
					// encoding: "FLAC",
					sampleRateHertz: sampleRate, //get value from fluent-ffmpeg
					languageCode: `en-US`,
					audioChannelCount: 2,
					enableSeparateRecognitionPerChannel: true,
					maxAlternatives: 0,
					enableAutomaticPunctuation: true,
					enableWordTimeOffsets: true,
					enableWordConfidence: true,
					useEnhanced: true,
					model: 'phone_call'
				};
			}
			else if (file.metadata.stereo === 'false') {
				audioConfig = {
					// encoding: "FLAC",
					sampleRateHertz: sampleRate, //get value from fluent-ffmpeg
					languageCode: `en-US`,
					enableAutomaticPunctuation: true,
					enableSpeakerDiarization: true,
					diarizationSpeakerCount: 2,
					enableWordTimeOffsets: true,
					enableWordConfidence: true,
					useEnhanced: true,
					model: 'phone_call'
				};
			}
			else if (file.metadata.stereo === undefined) {
				let safErrorAgent = 'Please include if the audio file is stereo or mono'
				callback(safErrorAgent);
			}

			// send audio file to STT, get job name, add to pub/sub object and publish message
			const audioRequest = {
				audio: audioPath,
				config: audioConfig,
			};

			let pubSubObj = {
				'fileid': uniqid.time(),
				'filename': `gs://${file.bucket}/${file.name}`,
				'callid': file.metadata.callid === undefined ? 'undefined' : file.metadata.callid,
				'date': Date(Date.now()),
				'year': file.metadata.year === undefined ? 'undefined' : file.metadata.year,
				'month': file.metadata.month === undefined ? 'undefined' : file.metadata.month,
				'day': file.metadata.day === undefined ? 'undefined' : file.metadata.day,
				'starttime': file.metadata.starttime === undefined ? 'undefined' : file.metadata.starttime,
				'duration': duration, //get value from fluent-ffmpeg
				'stereo': file.metadata.stereo === undefined ? 'undefined' : file.metadata.stereo,
			};

			client
				.longRunningRecognize(audioRequest)
				.then(response => {
					const [operation, initialApiResponse] = response;
					return initialApiResponse;
				})
				.then(response => {
					pubSubObj['sttnameid'] = response.name; // add STT 'name' ID to pubSubObj
				})
				.then(() => {
					const pubSubData = JSON.stringify(pubSubObj);
					const dataBuffer = Buffer.from(pubSubData);
					const pubsub = new PubSub();
					return pubsub
						.topic(topicName)
						.publisher()
						.publish(dataBuffer)
						.then(messageId => {
							console.log(`Message ${messageId} published.`);
							callback(null, 'Success!');
						})
						.catch(err => {
							console.error('ERROR:', err);
						});
				});

		});
	}).catch(err => console.error(err))

};