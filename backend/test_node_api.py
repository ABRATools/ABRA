import NodeAPI
import asyncio
import podman

async def test_NodeAPI():
    nodeapi = NodeAPI.NodeAPI("http+unix:///run/podman/podman.sock")
    await nodeapi.run()

def test_socket_conn():
    uri = "http+unix:///run/podman/podman.sock"
    with podman.PodmanClient(base_url=uri) as client:
        for container in client.containers.list():
            container.reload()
            c=client.containers.get(container.name)
            print(f"{c.id}:{c.name}:{c.status}")

def test_client():
    with podman.Client() as client:
        if client.ping():
            images = client.images.list()
            for image in images:
                print(image.id)


if __name__ == "__main__":
    asyncio.run(test_NodeAPI())
    # test_socket_conn()
    # test_client()
