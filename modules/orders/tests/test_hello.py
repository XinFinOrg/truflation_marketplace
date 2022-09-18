import pytest
from tfi_orders import create_app

@pytest.fixture()
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
    })
    # other setup can go here
    yield app

@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()

def test_request_example(client):
    response = client.get("/hello")
    assert b"<h2>Hello, World!</h2>" in response.data

def test_request_post(client):
    response = client.post("/", data={})

