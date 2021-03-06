// @flow
import React from 'react'
import EventListener from 'react-event-listener'
import { connect } from 'react-redux'
import * as actions from './../actions/actions'
import WordArea from '../components/WordArea'
import type { State } from '../types'

type Props = {
  inputKey: (value: string) => void,
  fetchWords: (rank: number) => Promise<any>,
  backChar: () => void,
  setRank: (value: number) => void,
  reset: () => void,
} & State

class Game extends React.Component<Props> {
  componentWillMount() {
    const { fetchWords } = this.props
    fetchWords(1)
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.wordIndex !== this.props.wordIndex) {
      this.playEnglishSound(this.props.words[this.props.wordIndex].en)
    }
  }

  onKeyDown = (e: SyntheticKeyboardEvent<HTMLBodyElement>) => {
    const { activeElement } = document
    if (activeElement && activeElement.tagName === 'INPUT') {
      return
    }
    const { backChar, inputKey, currentInput } = this.props
    if (e.key === 'Backspace' && currentInput.length > 0) {
      backChar()
    } else if (e.key.length === 1) {
      inputKey(e.key)
      if (e.key === ' ') {
        // prevent page scroll by space key
        e.preventDefault()
      }
    }
  }

  onKeyDownRank = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
    const { fetchWords, rank, isFetching } = this.props
    if (e.key === 'Enter' && !isFetching) {
      e.currentTarget.blur()
      fetchWords(rank)
    }
  }

  onClick = () => {
    const { fetchWords, rank } = this.props
    fetchWords(rank)
  }

  onFocus = (e: SyntheticFocusEvent<HTMLInputElement>) => {
    e.currentTarget.select()
  }

  onChangeRank = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const { setRank } = this.props
    const rank = Number(e.currentTarget.value)
    setRank(rank)
  }

  playEnglishSound = (en: string) => {
    const audio: Audio = new Audio(`assets/audio/${en}.flac`)
    audio.play()
  }

  render() {
    const {
      words,
      wordIndex,
      currentInput,
      fetchError,
      isFetching,
    } = this.props
    return (
      <div className="game">
        <EventListener onKeyDown={this.onKeyDown} target="window" />
        {fetchError && (
          <p style={{ color: 'red' }}>
            エラーが起きました: {fetchError.status}
          </p>
        )}
        {words.length > 0 && (
          <WordArea
            words={words}
            wordIndex={wordIndex}
            currentInput={currentInput}
          />
        )}
        <div className="input-group input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">Rank: </span>
          </div>
          <input
            type="number"
            name="rank"
            min="1"
            max="30"
            onChange={this.onChangeRank}
            onFocus={this.onFocus}
            onKeyDown={this.onKeyDownRank}
            defaultValue="1"
          />
          <button
            className="btn btn-outline-primary"
            onClick={this.onClick}
            disabled={isFetching}
          >
            {isFetching ? 'Loading...' : 'Update'}
          </button>
        </div>
      </div>
    )
  }
}

export default connect(
  s => s,
  actions,
)(Game)
