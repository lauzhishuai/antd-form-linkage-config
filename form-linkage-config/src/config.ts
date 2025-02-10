interface OptionItem {
  optionValue: number | string
  disabled?: boolean
}

interface LinkConfigItem {
  formName: string
  changeValue: any
  options?: OptionItem[]
  hidden?: boolean
  disabled?: boolean
  hiddenAndSave?: boolean
}

interface LinkConfigValue {
  [key: string]: LinkConfigItem[]
}

interface LinkConfig {
  [key: string]: LinkConfigValue
}

export const linkConfig: LinkConfig = {
  activeItem1: {
    2: [
      {
        formName: 'targetItem1',
        changeValue: 1,
        options: [
          {
            optionValue: 1,
            disabled: true,
          },
        ],
      },
      {
        formName: 'targetItem2',
        changeValue: 1,
      },
      {
        formName: 'targetItem3',
        changeValue: 1,
        hidden: true,
      },
    ],
  },
  activeItem2: {
    2: [
      {
        formName: 'targetItem1',
        changeValue: 2,
      },
      {
        formName: 'targetItem2',
        changeValue: 1,
        options: [
          {
            optionValue: 2,
            disabled: true,
          },
        ],
      },
    ],
  },
}
