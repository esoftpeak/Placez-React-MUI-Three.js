import '@google/model-viewer';

interface Props {
  modelUrl: string;
}

const ModelViewer = (props: Props) => {
  const { modelUrl } = props;

  return (
    <>
      <model-viewer
        ar
        ar-placement="floor"
        camera-controls
        background-color="#bbb"
        style={{ height: '400px', width: '600px' }}
        src={modelUrl}
      />
    </>
  );
};

export default ModelViewer;
