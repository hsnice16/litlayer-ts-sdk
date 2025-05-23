# Integration Tests

To run the tests.

1. Create `.env.test` file in the root directory
2. Add `PRIV_KEY`, `HTTP_URL`, and `WEBSOCKET_URL` variable in `.env.test` file
3. Run `yarn run test` in the root directory

- A new `ws/` directory will be created for WebSocket client tests, following the structure of `apis/` for organization.
