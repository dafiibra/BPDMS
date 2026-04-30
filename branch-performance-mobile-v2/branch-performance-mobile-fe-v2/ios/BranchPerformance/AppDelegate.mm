#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTEventDispatcherProtocol.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"BranchPerformance";
  self.initialProps = @{};

  BOOL result = [super application:application didFinishLaunchingWithOptions:launchOptions];

  [[NSNotificationCenter defaultCenter] addObserver:self
    selector:@selector(onScreenshotTaken)
    name:UIApplicationUserDidTakeScreenshotNotification
    object:nil];

  [[NSNotificationCenter defaultCenter] addObserver:self
    selector:@selector(onScreenCaptureChanged)
    name:UIScreenCapturedDidChangeNotification
    object:nil];

  return result;
}

- (void)onScreenshotTaken
{
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"ScreenshotTaken" body:nil];
}

- (void)onScreenCaptureChanged
{
  BOOL isCaptured = UIScreen.mainScreen.isCaptured;
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"ScreenCaptureChanged"
    body:@{@"isCaptured": @(isCaptured)}];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
