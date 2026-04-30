#import "RCTCallStateModule.h"
#import <CallKit/CallKit.h>

@interface RCTCallStateModule () <CXCallObserverDelegate>
@property (nonatomic, strong) CXCallObserver *callObserver;
@end

@implementation RCTCallStateModule

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _callObserver = [[CXCallObserver alloc] init];
        [_callObserver setDelegate:self queue:dispatch_get_main_queue()];
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"CallStateChanged"];
}

RCT_EXPORT_METHOD(startListening) {}
RCT_EXPORT_METHOD(stopListening) {}

- (void)callObserver:(CXCallObserver *)callObserver callChanged:(CXCall *)call {
    NSString *state;
    if (!call.hasEnded && call.hasConnected) {
        state = @"OFFHOOK";
    } else if (!call.hasEnded && !call.hasConnected) {
        state = @"RINGING";
    } else {
        state = @"IDLE";
    }
    [self sendEventWithName:@"CallStateChanged" body:state];
}

@end
