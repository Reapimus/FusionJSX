/// <reference types="@rbxts/types" />

import Fusion, { Scope, StateObject } from "@reapimus/fusion";

type lowercaseCreatableInstances = {
	[P in keyof CreatableInstances as Lowercase<P>]: CreatableInstances[P];
};


declare global {
	namespace JSX {
		type Element = Instance
		export type JsxInstance<T extends Instance> = {
			[P in WritablePropertyNames<T>]?: T[P] | StateObject<T[P]>;
		} & {
			Scope: Scope<unknown>;
			Attributes?: {
				[name: string]: AttributeValue;
			};
			AttributeOut?: {
				[name: string]: (value: AttributeValue) => void;
			};
			OnAttributeChange?: {
				[name: string]: (newValue: AttributeValue) => void;
			};
			OnChange?: Partial<{
				[K in Exclude<ExcludeKeys<T, symbol | Callback | RBXScriptSignal<Callback>>, "Changed">]:
					| ((newValue: T[K]) => void)
					| undefined;
			}>;
			Out?: Partial<{
				[K in ExcludeKeys<T, symbol | Callback | RBXScriptSignal<Callback>>]:
					| ((ref: T[K]) => void)
					| undefined;
			}>;
			Changed?: (property: string) => void;
		} & {
			[K in InstanceEventNames<T>]?: T[K] extends RBXScriptSignal<infer C>
				? (...args: Parameters<C>) => void
				: never;
		};
		type IntrinsicElements<T extends Instance> = {
			[K in keyof lowercaseCreatableInstances]: JsxInstance<lowercaseCreatableInstances[K]>;
		};
	}
}

export {}