import { BatchTypes } from "../../../../../blue/model/batchPatterns"

type BatchSelectProps = {
  value: BatchTypes
  onChange: (value: BatchTypes) => void
}

const BatchSelect = (props: BatchSelectProps) => {
  return (
    <div>
      BatchSelect
    </div>
  )
}

export default BatchSelect
