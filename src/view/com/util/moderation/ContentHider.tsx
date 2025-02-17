import React from 'react'
import {Pressable, StyleProp, StyleSheet, View, ViewStyle} from 'react-native'
import {usePalette} from 'lib/hooks/usePalette'
import {useWebMediaQueries} from 'lib/hooks/useWebMediaQueries'
import {ModerationUI} from '@atproto/api'
import {Text} from '../text/Text'
import {ShieldExclamation} from 'lib/icons'
import {describeModerationCause} from 'lib/moderation'
import {useStores} from 'state/index'

export function ContentHider({
  testID,
  moderation,
  ignoreMute,
  style,
  childContainerStyle,
  children,
}: React.PropsWithChildren<{
  testID?: string
  moderation: ModerationUI
  ignoreMute?: boolean
  style?: StyleProp<ViewStyle>
  childContainerStyle?: StyleProp<ViewStyle>
}>) {
  const store = useStores()
  const pal = usePalette('default')
  const {isMobile} = useWebMediaQueries()
  const [override, setOverride] = React.useState(false)

  if (!moderation.blur || (ignoreMute && moderation.cause?.type === 'muted')) {
    return (
      <View testID={testID} style={style}>
        {children}
      </View>
    )
  }

  const desc = describeModerationCause(moderation.cause, 'content')
  return (
    <View testID={testID} style={style}>
      <Pressable
        onPress={() => {
          if (!moderation.noOverride) {
            setOverride(v => !v)
          } else {
            store.shell.openModal({
              name: 'moderation-details',
              context: 'content',
              moderation,
            })
          }
        }}
        accessibilityRole="button"
        accessibilityHint={override ? 'Hide the content' : 'Show the content'}
        accessibilityLabel=""
        style={[
          styles.cover,
          {paddingRight: isMobile ? 22 : 18},
          moderation.noOverride
            ? {borderWidth: 1, borderColor: pal.colors.borderDark}
            : pal.viewLight,
        ]}>
        <Pressable
          onPress={() => {
            store.shell.openModal({
              name: 'moderation-details',
              context: 'content',
              moderation,
            })
          }}
          accessibilityRole="button"
          accessibilityLabel="Learn more about this warning"
          accessibilityHint="">
          <ShieldExclamation size={18} style={pal.text} />
        </Pressable>
        <Text type="lg" style={pal.text}>
          {desc.name}
        </Text>
        {!moderation.noOverride && (
          <View style={styles.showBtn}>
            <Text type="xl" style={pal.link}>
              {override ? 'Hide' : 'Show'}
            </Text>
          </View>
        )}
      </Pressable>
      {override && <View style={childContainerStyle}>{children}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  cover: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    marginTop: 4,
    paddingVertical: 14,
    paddingLeft: 14,
  },
  showBtn: {
    marginLeft: 'auto',
    alignSelf: 'center',
  },
})
