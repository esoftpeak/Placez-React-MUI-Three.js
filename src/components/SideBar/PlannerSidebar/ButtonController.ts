export default class ButtonController {
  label: string;
  hidden: boolean;
  disabled: boolean;
  selected: boolean;
  onClick: () => void;

  constructor(
    label: string,
    hidden: boolean,
    disabled: boolean,
    selected: boolean,
    onClick: () => void
  ) {
    this.label = label;
    this.hidden = hidden;
    this.disabled = disabled;
    this.selected = selected;
    this.onClick = onClick;
  }
}
