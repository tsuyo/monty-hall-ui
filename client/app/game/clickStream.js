	var clicks, dom3, touch, integration;

	clicks = require('clicks');
	dom3 = require('clicks/events/dom3');
	touch = require('clicks/events/touch');

	// TODO replace integration/integration with integration once curl is updated to 0.7.x
	// integration = require('integration');
	integration = require('integration/integration');
	require('integration/aggregators/batching');
	require('integration/channels/pubsub');

	module.exports = function () {
		var bus;

		return {
			start: function (client) {
				this.stop();

				bus = integration.bus();

				clicks.stream(bus.inboundAdapter('stream'));
				bus.pubsub('stream');
				bus.batchingAggregator('batcher', { batch: 500, timeout: 5e3, input: 'stream', output: 'chunkedStream' });
				bus.pubsub('chunkedStream');
				bus.subscribe('chunkedStream', bus.outboundAdapter(function (chunk) {
					client({
						method: 'post',
						entity: { data: JSON.stringify(chunk) }
					});
				}));

				clicks.attach(touch.types).attach(dom3.types);
			},
			stop: function () {
				clicks.detach();
				if (bus && bus.destroy) {
					bus.destroy();
				}
			}
		}
	};
