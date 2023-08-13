import * as React from 'react'

import Option from './Option'
import OptionContext from './OptionContext'

function getComponentOptionValue(component: React.ComponentClass) {
  const optionValue = (component as any).optionValue
  if (!optionValue) {
    throw new Error(`optionValue should be provided for ${component}`)
  }
  return optionValue
}

export interface Props {
  option: Option
  defaultOption: React.ComponentClass | string
  children: React.ReactNode
}

// @ts-ignore

export default class Selector extends React.Component<Props> {
  static contextType = OptionContext // Updated contextType declaration

  private get optionContext(): OptionContext {
    return this.context
  }

  componentDidMount() {
    const { option, defaultOption } = this.props
    const { optionContext } = this
    const defaultValue =
      typeof defaultOption === 'string'
        ? defaultOption
        : getComponentOptionValue(defaultOption)
    optionContext.optionEnter(option.key)
    const optionState = optionContext.getOptionState(option.key)
    this.updateOptionValues()
    if (optionState) {
      optionContext.setDefaultValue(option.key, defaultValue)
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.children !== prevProps.children) {
      this.updateOptionValues()
    }
  }

  componentWillUnmount() {
    this.optionContext.optionExit(this.props.option.key)
  }

  render() {
    let result: React.ReactNode | null = null
    const { option, children } = this.props
    const value = this.optionContext.getValue(option.key)!
    React.Children.forEach(children, (child) => {
      if (getComponentOptionValue((child as any).type) === value) {
        result = child
      }
    })
    return result
  }

  private updateOptionValues() {
    const { option, children } = this.props
    const values = React.Children.map(children, (child) =>
      getComponentOptionValue((child as any).type)
    )
    if (new Set(values).size !== values?.length) {
      throw new Error('Duplicate values')
    }
    this.optionContext.setOptions(option.key, values)
  }
}
